import {
  assert,
  deserializeBatch,
  EthereumAddress,
  Hex,
  TransactionBatch,
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

    interface StateMapValue {
      balance: Unsigned64
      nonce: Unsigned64
    }
    type StateMap = Record<string, StateMapValue>

    const executeBatch = (
      state: StateMap,
      batch: TransactionBatch,
      batchPoster: EthereumAddress,
    ): void => {
      const getOrInsert = (
        state: StateMap,
        key: string,
        defaultValue: StateMapValue,
      ): StateMapValue => {
        const result = state[key]
        if (result !== undefined) {
          return result
        } else {
          state[key] = { ...defaultValue }
          // NOTE(radomski): We know that it won't be undefined we insert into that slot in the above line
          // eslint-disable-next-line
          return state[key]!
        }
      }

      const defaultState: StateMapValue = {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      }

      const feeRecipientAccount = getOrInsert(
        state,
        batchPoster.toString(),
        defaultState,
      )
      for (const tx of batch) {
        // Step 0. Check transaction type
        assert(tx.from !== Hex(0) && tx.to !== Hex(0))

        const fromAccount = getOrInsert(state, tx.from.toString(), defaultState)
        const toAccount = getOrInsert(state, tx.to.toString(), defaultState)

        // Step 1. Update nonce
        assert(
          fromAccount.nonce === Unsigned64(Unsigned64.toBigInt(tx.nonce) - 1n),
        )
        fromAccount.nonce = tx.nonce

        // Step 2. Subtract spending
        assert(
          Unsigned64.toBigInt(fromAccount.balance) >=
            Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(tx.fee),
        )

        fromAccount.balance = Unsigned64(
          Unsigned64.toBigInt(fromAccount.balance) -
            (Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(tx.fee)),
        )

        // Step 3. Transfer value
        toAccount.balance = Unsigned64(
          Unsigned64.toBigInt(tx.value) +
            Unsigned64.toBigInt(toAccount.balance),
        )

        // Step 4. Pay fee
        feeRecipientAccount.balance = Unsigned64(
          Unsigned64.toBigInt(tx.fee) +
            Unsigned64.toBigInt(feeRecipientAccount.balance),
        )
      }
    }

    const state: StateMap = {}
    const accountRepository = new AccountRepository(database)
    accountRepository.getAll().forEach(
      (acc) =>
        (state[acc.address] = {
          balance: Unsigned64(acc.balance),
          nonce: Unsigned64(acc.nonce),
        }),
    )

    assert(
      batches.length === callDataPosters.length,
      'The amount of decoded batches is not equal to the amount of poster address',
    )
    for (let i = 0; i < batches.length; i++) {
      // NOTE(radomski): We know that it won't be undefined because of the assert above this for loop
      // eslint-disable-next-line
      executeBatch(state, batches[i]!, callDataPosters[i]!)
    }

    accountRepository.addOrUpdateMany(
      Object.entries(state).map(([address, value]) => {
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
