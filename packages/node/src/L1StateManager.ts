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
  Hex,
  TransactionBatch,
  Unsigned64,
  assert,
  deserializeBatch,
} from '@byor/shared'
import { Database } from './db/Database'

export class L1StateManager {
  private client: PublicClient
  private contractAddress: ViemHex

  constructor(config: Config) {
    this.contractAddress = Hex.toString(config.ctcContractAddress) as ViemHex

    const chain = { ...mainnet } as Chain
    console.log(chain.rpcUrls)
    chain.rpcUrls = {
      default: { http: [config.rpcUrl] },
      public: { http: [config.rpcUrl] },
    }

    this.client = createPublicClient({
      chain,
      transport: http(),
    })
  }

  async getNewLogs(lastBlock: bigint): Promise<GetLogsReturnType> {
    const logsPromise = this.client.getLogs({
      address: this.contractAddress,
      event: parseAbiItem('event BatchAppended(address sender)'),
      fromBlock: lastBlock,
    })

    return logsPromise
  }

  async getWholeL1State(): Promise<GetLogsReturnType> {
    return this.getNewLogs(0n)
  }

  async eventsToCallData(events: GetLogsReturnType): Promise<Hex[]> {
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

  async applyWholeState(database: Database): Promise<void> {
    const existingL1CallData = await this.eventsToCallData(
      await this.getWholeL1State(),
    )
    this.apply(existingL1CallData, database)
  }

  async apply(l1State: Hex[], database: Database): Promise<void> {
    const batches = await Promise.all(
      l1State.map((hex) => deserializeBatch(hex)),
    )

    type StateMap = Record<string, { balance: Unsigned64; nonce: Unsigned64 }>

    const executeBatch = (state: StateMap, batch: TransactionBatch) => {
      for (const tx of batch) {
        // Step 0. Check transaction type
        assert(tx.from != Hex(0) && tx.to != Hex(0))

        const from = tx.from.toString()
        const to = tx.to.toString()
        if (state[from] === undefined) {
          state[from] = {
            balance: Unsigned64(10000),
            nonce: Unsigned64(0),
          }
        }

        if (state[to] === undefined) {
          state[to] = {
            balance: Unsigned64(0),
            nonce: Unsigned64(0),
          }
        }

        // Step 1. Update nonce
        assert(
          state[from]?.nonce == Unsigned64(Unsigned64.toBigInt(tx.nonce) - 1n),
        )
        state[from]!.nonce = tx.nonce

        // Step 2. Subtract spending
        console.log(
          Unsigned64.toBigInt(state[from]!.balance),
          Unsigned64.toBigInt(tx.value),
          Unsigned64.toBigInt(tx.fee),
        )
        assert(
          Unsigned64.toBigInt(state[from]!.balance) >=
            Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(tx.fee),
        )
        state[from]!.balance = Unsigned64(
          Unsigned64.toBigInt(state[from]!.balance) -
            Unsigned64.toBigInt(tx.value) +
            Unsigned64.toBigInt(tx.fee),
        )

        // Step 3. Transfer value
        state[to]!.balance = Unsigned64(
          Unsigned64.toBigInt(tx.value) +
            Unsigned64.toBigInt(state[to]!.balance),
        )

        // Step 4. Pay fee
        state[tx.feeRecipient].value += tx.fee
      }
    }

    const state: StateMap = {}
    for (const batch of batches) {
      executeBatch(state, batch)
    }
    console.log(state)
  }
}
