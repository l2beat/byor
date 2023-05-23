import { assert, deserializeBatch, EthereumAddress, Hex } from '@byor/shared'
import { zip } from 'lodash'
import {
  createPublicClient,
  decodeFunctionData,
  GetLogsReturnType,
  Hex as ViemHex,
  http,
  parseAbiItem,
  PublicClient,
} from 'viem'
import { Chain, mainnet } from 'viem/chains'

import { Config } from './config'
import { abi } from './config/abi'
import { AccountRepository } from './db/AccountRepository'
import { StateMap, TransactionExecutor } from './TransactionExecutor'

const eventAbi = parseAbiItem('event BatchAppended(address sender)')
type EventAbiType = typeof eventAbi
type BatchAppendedLogsType = GetLogsReturnType<EventAbiType>

export class L1StateManager {
  private readonly client: PublicClient
  private readonly contractAddress: ViemHex
  private readonly accountRepository: AccountRepository

  constructor(config: Config, accountRepository: AccountRepository) {
    this.contractAddress = Hex.toString(config.ctcContractAddress) as ViemHex
    this.accountRepository = accountRepository

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

  async getLogsSince(lastBlock: bigint): Promise<BatchAppendedLogsType> {
    const logsPromise = this.client.getLogs({
      address: this.contractAddress,
      event: eventAbi,
      fromBlock: lastBlock,
    })

    return logsPromise
  }

  async getWholeL1State(): Promise<BatchAppendedLogsType> {
    return this.getLogsSince(0n)
  }

  async eventsToCallData(events: BatchAppendedLogsType): Promise<Hex[]> {
    const txs = await Promise.all(
      events.map((event) => {
        assert(
          event.transactionHash !== null,
          'Expected the transaction hash in the event to be non-null',
        )

        return this.client.getTransaction({
          hash: event.transactionHash,
        })
      }),
    )

    const decoded = txs.map((tx) => {
      const { args } = decodeFunctionData({
        abi: abi,
        data: tx.input,
      })

      return Hex(args[0])
    })

    return decoded
  }

  eventsToPosters(events: BatchAppendedLogsType): EthereumAddress[] {
    return events.map((e) => EthereumAddress(e.args.sender))
  }

  async applyWholeState(): Promise<void> {
    const l1State = await this.getWholeL1State()
    const existingL1CallData = await this.eventsToCallData(l1State)
    const callDataPosters = this.eventsToPosters(l1State)
    await this.apply(existingL1CallData, callDataPosters)
  }

  async apply(
    l1State: Hex[],
    callDataPosters: EthereumAddress[],
  ): Promise<void> {
    const batches = await Promise.all(
      l1State.map((hex) => deserializeBatch(hex)),
    )

    assert(
      batches.length === callDataPosters.length,
      'The amount of decoded batches is not equal to the amount of poster address',
    )

    const initialState: StateMap = {}
    this.accountRepository.getAll().forEach(
      (acc) =>
        (initialState[acc.address.toString()] = {
          balance: acc.balance,
          nonce: acc.nonce,
        }),
    )

    const txExecutor = new TransactionExecutor(initialState)

    for (const [batch, poster] of zip(batches, callDataPosters)) {
      // NOTE(radomski): We know that it won't be undefined
      // because of the assert at the beginning of this function
      // eslint-disable-next-line
      txExecutor.executeBatch(batch!, poster!)
    }

    const updatedState = txExecutor.finalize()
    console.log(updatedState)
    this.accountRepository.addOrUpdateMany(
      Object.entries(updatedState).map(([address, value]) => {
        return {
          address: EthereumAddress(address),
          balance: value.balance,
          nonce: value.nonce,
        }
      }),
    )
  }
}
