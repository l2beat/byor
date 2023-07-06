import { assert, EthereumAddress, Hex } from '@byor/shared'
import { zipWith } from 'lodash'
import { decodeFunctionData, GetLogsReturnType, parseAbiItem } from 'viem'

import { abi } from './config/abi'
import { FetcherRecord, FetcherRepository } from './db/FetcherRepository'
import { L1EventStateType } from './L1EventStateType'
import { EthereumClient } from './peripherals/ethereum/EthereumClient'
import { Logger } from './tools/Logger'

const eventAbi = parseAbiItem('event BatchAppended(address sender)')
type EventAbiType = typeof eventAbi
type BatchAppendedLogsType = GetLogsReturnType<EventAbiType>

export class L1StateFetcher {
  private lastFetchedBlock = 0n

  constructor(
    private readonly client: EthereumClient,
    private readonly fetcherRepository: FetcherRepository,
    private readonly contractAddress: EthereumAddress,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
  }

  async start(): Promise<void> {
    const fetcher = await this.fetcherRepository.getByChainIdOrDefault(
      this.client.getChainId(),
    )
    this.lastFetchedBlock = fetcher.lastFetchedBlock
  }

  async getNewState(): Promise<L1EventStateType[]> {
    this.logger.debug('Fetching new events', {
      contractAddress: this.contractAddress.toString(),
      eventAbi: eventAbi.name,
      lastFetchedBlock: this.lastFetchedBlock.toString(),
    })

    const l1State = await this.client.getLogsInRange(
      eventAbi,
      this.contractAddress,
      this.lastFetchedBlock + 1n,
    )
    const calldata = await this.eventsToCallData(l1State)
    const timestamps = await this.eventsToTimestamps(l1State)
    const posters = eventsToPosters(l1State)

    assert(
      l1State.length === posters.length && l1State.length === timestamps.length,
      'The amount of calldata is not equal to the amount of poster address or amount of timestamps',
    )

    for (const event of l1State) {
      if (event.blockNumber) {
        this.lastFetchedBlock =
          this.lastFetchedBlock > event.blockNumber
            ? this.lastFetchedBlock
            : event.blockNumber
      }
    }

    await this.updateFetcherDatabase()

    return zipWith(
      posters,
      timestamps,
      calldata,
      (poster, timestamp, calldata) => {
        return { poster, timestamp, calldata }
      },
    )
  }

  async eventsToCallData(events: BatchAppendedLogsType): Promise<Hex[]> {
    const txs = await Promise.all(
      events.map((event) => {
        assert(
          event.transactionHash !== null,
          'Expected the transaction hash in the event to be non-null',
        )

        return this.client.getTransaction(Hex(event.transactionHash))
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

  async eventsToTimestamps(events: BatchAppendedLogsType): Promise<Date[]> {
    const blocks = await Promise.all(
      events.map((event) => {
        assert(
          event.blockHash !== null,
          'Expected the block hash in the event to be non-null',
        )

        return this.client.getBlockHeader(Hex(event.blockHash))
      }),
    )

    const timestamps = blocks.map((block) => {
      return new Date(parseInt(block.timestamp.toString(), 10) * 1000)
    })

    return timestamps
  }

  async updateFetcherDatabase(): Promise<void> {
    const record: FetcherRecord = {
      chainId: this.client.getChainId(),
      lastFetchedBlock: this.lastFetchedBlock,
    }

    await this.fetcherRepository.addOrUpdate(record)
  }
}

function eventsToPosters(events: BatchAppendedLogsType): EthereumAddress[] {
  return events.map((e) => EthereumAddress(e.args.sender))
}
