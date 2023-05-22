import {
  assert,
  deserializeBatch,
  EthereumAddress,
  Hex,
  Unsigned64,
} from '@byor/shared'
import {
  createPublicClient,
  decodeAbiParameters,
  GetLogsReturnType,
  Hex as ViemHex,
  http,
  parseAbiItem,
  PublicClient,
} from 'viem'
import { Chain, mainnet } from 'viem/chains'

import { Config } from './config'
import { AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'
import { StateMap, TransactionExecutor } from './TransactionExecutor'

const abi = parseAbiItem('event BatchAppended(address sender)')
type EventAbiType = typeof abi
type BatchAppendedLogsType = GetLogsReturnType<EventAbiType>

export class L1StateManager {
  private readonly client: PublicClient
  private readonly contractAddress: ViemHex

  constructor(config: Config) {
    this.contractAddress = Hex.toString(config.ctcContractAddress) as ViemHex

    const chain = { ...mainnet } as Chain
    chain.id = config.chainId
    chain.rpcUrls = {
      default: { http: [config.rpcUrl] },
      public: { http: [config.rpcUrl] },
    }

    this.client = createPublicClient({
      chain,
      transport: http(),
    })
  }

  async getNewLogs(lastBlock: bigint): Promise<BatchAppendedLogsType> {
    const logsPromise = this.client.getLogs({
      address: this.contractAddress,
      event: parseAbiItem('event BatchAppended(address sender)'),
      fromBlock: lastBlock,
    })

    return logsPromise
  }

  async getWholeL1State(): Promise<BatchAppendedLogsType> {
    return this.getNewLogs(0n)
  }

  async eventsToCallData(events: BatchAppendedLogsType): Promise<Hex[]> {
    const txs = await Promise.all(
      events.map((event) => {
        if (event.transactionHash === null) {
          throw new Error("Event's transaction hash is null")
        }

        return this.client.getTransaction({
          hash: event.transactionHash,
        })
      }),
    )

    const decoded = txs.map((tx) => {
      // Remove hex prefix (0x) and 4 bytes of
      // function signature (4 bytes -> 8 hex characters)
      const calldata = `0x${tx.input.slice(10)}` as const
      const params = decodeAbiParameters(
        [{ name: '', type: 'bytes' }],
        calldata,
      )
      return Hex(params[0])
    })

    return decoded
  }

  eventsToPosters(events: BatchAppendedLogsType): EthereumAddress[] {
    return events.map((e) => EthereumAddress(e.args.sender))
  }

  async applyWholeState(database: Database): Promise<void> {
    const l1State = await this.getWholeL1State()
    const existingL1CallData = await this.eventsToCallData(l1State)
    const callDataPosters = this.eventsToPosters(l1State)
    await this.apply(existingL1CallData, callDataPosters, database)
  }

  async apply(
    l1State: Hex[],
    callDataPosters: EthereumAddress[],
    database: Database,
  ): Promise<void> {
    const batches = await Promise.all(
      l1State.map((hex) => deserializeBatch(hex)),
    )

    const initialState: StateMap = {}
    const accountRepository = new AccountRepository(database)
    accountRepository.getAll().forEach(
      (acc) =>
        (initialState[acc.address] = {
          balance: Unsigned64(acc.balance),
          nonce: Unsigned64(acc.nonce),
        }),
    )

    const txExecutor = new TransactionExecutor(initialState)

    assert(
      batches.length === callDataPosters.length,
      'The amount of decoded batches is not equal to the amount of poster address',
    )
    for (let i = 0; i < batches.length; i++) {
      // NOTE(radomski): We know that it won't be undefined because of the assert above this for loop
      // eslint-disable-next-line
      txExecutor.executeBatch(batches[i]!, callDataPosters[i]!)
    }

    const updatedState = txExecutor.finalize()
    accountRepository.addOrUpdateMany(
      Object.entries(updatedState).map(([address, value]) => {
        // WARNING(radomski): This can fail very badly if the value represented
        // by 'BigInt' is so big that the floating point nature of 'number'
        // causes it to lose precision. This can happen when the value is
        // bigger then Number.MAX_SAFE_INTEGER. drizzle-orm should support
        // passing values as bigints into the query but it currently does
        // not (see https://github.com/drizzle-team/drizzle-orm/issues/611).
        // For real applications where the upper parts of the 64bit values
        // are needed please consider removing drizzle-orm!

        assert(
          Unsigned64.toBigInt(value.balance) <= BigInt(Number.MAX_SAFE_INTEGER),
          'The Unsigned64 value is bigger than the biggest safely representable value',
        )
        assert(
          Unsigned64.toBigInt(value.nonce) <= BigInt(Number.MAX_SAFE_INTEGER),
          'The Unsigned64 value is bigger than the biggest safely representable value',
        )

        const balanceAsNumber = parseInt(value.balance.toString(), 10)
        const nonceAsNumber = parseInt(value.nonce.toString(), 10)

        return {
          address: address,
          balance: balanceAsNumber,
          nonce: nonceAsNumber,
        }
      }),
    )
  }
}
