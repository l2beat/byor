import { Config } from './config'
import { Chain, mainnet } from 'viem/chains'
import {
  createPublicClient,
  decodeAbiParameters,
  GetLogsReturnType,
  http,
  parseAbiItem,
  PublicClient,
  Hex as ViemHex,
} from 'viem'
import {
  EthereumAddress,
  Hex,
  TransactionBatch,
  Unsigned64,
  assert,
  deserializeBatch,
} from '@byor/shared'
import { Database } from './db/Database'
import { Statement } from 'better-sqlite3'

const abi = parseAbiItem('event BatchAppended(address sender)')
type EventAbiType = typeof abi
type BatchAppendedLogsType = GetLogsReturnType<EventAbiType>

export class L1StateManager {
  private client: PublicClient
  private contractAddress: ViemHex

  constructor(config: Config) {
    this.contractAddress = Hex.toString(config.ctcContractAddress) as ViemHex

    const chain = { ...mainnet } as Chain
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
      events.map((event) =>
        this.client.getTransaction({
          hash: event.transactionHash as ViemHex,
        }),
      ),
    )

    const decoded = txs.map((tx) => {
      const calldata = `0x${tx.input.slice(10)}` as ViemHex
      const params = decodeAbiParameters(
        [{ name: '', type: 'bytes' }],
        calldata,
      )
      assert(
        params.length === 1,
        'Invalid number of params decoded from calldata',
      )
      return Hex(params[0])
    })

    return decoded
  }

  async eventsToPosters(
    events: BatchAppendedLogsType,
  ): Promise<EthereumAddress[]> {
    return events.map((e) => EthereumAddress(e.args.sender))
  }

  async applyWholeState(database: Database): Promise<void> {
    const l1State = await this.getWholeL1State()
    const existingL1CallData = await this.eventsToCallData(l1State)
    const callDataPosters = await this.eventsToPosters(l1State)
    this.apply(existingL1CallData, callDataPosters, database)
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
    ) => {
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
          return state[key]!
        }
      }

      const defaultState1: StateMapValue = {
        balance: Unsigned64(10000),
        nonce: Unsigned64(0),
      }

      const defaultState2: StateMapValue = {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      }

      const feeRecipientAccount = getOrInsert(
        state,
        batchPoster.toString(),
        defaultState1,
      )
      for (const tx of batch) {
        // Step 0. Check transaction type
        assert(tx.from != Hex(0) && tx.to != Hex(0))

        const fromAccount = getOrInsert(
          state,
          tx.from.toString(),
          defaultState1,
        )
        const toAccount = getOrInsert(state, tx.to.toString(), defaultState2)

        // Step 1. Update nonce
        assert(
          fromAccount.nonce == Unsigned64(Unsigned64.toBigInt(tx.nonce) - 1n),
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
    assert(
      batches.length === callDataPosters.length,
      'The amount of decoded batches is not equal to the amount of poster address',
    )
    for (let i = 0; i < batches.length; i++) {
      executeBatch(state, batches[i]!, callDataPosters[i]!)
    }
    console.log(state)
  }
}
