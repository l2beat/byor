import { assert, EthereumAddress, Hex } from '@byor/shared'
import { zipWith } from 'lodash'
import { decodeFunctionData, GetLogsReturnType, parseAbiItem } from 'viem'

import { abi } from '../config/abi'
import {
  FetcherRecord,
  FetcherRepository,
} from '../peripherals/database/FetcherRepository'
import { EthereumClient } from '../peripherals/ethereum/EthereumClient'
import { Logger } from '../tools/Logger'
import { L1EventStateType } from './L1EventStateType'

const eventAbi = parseAbiItem('event BatchAppended(address sender)')
type EventAbiType = typeof eventAbi
export type BatchAppendedLogsType = GetLogsReturnType<EventAbiType>

export class L1StateFetcher {
  private lastFetchedBlock = 0n

  constructor(
    private readonly client: EthereumClient,
    private readonly fetcherRepository: FetcherRepository,
    private readonly contractAddress: EthereumAddress,
    private readonly logger: Logger,
    private readonly reorgOffset = 15n,
    private readonly batchSize = 10_000n,
  ) {
    this.logger = logger.for(this)
  }

  async start(): Promise<void> {
    const fetcher = await this.fetcherRepository.getByChainIdOrDefault(
      this.client.getChainId(),
    )
    this.lastFetchedBlock = fetcher.lastFetchedBlock
    this.logger.info('Started', {
      lastFetchedBlock: Number(this.lastFetchedBlock),
    })
  }

  getLastFetchedBlock(): bigint {
    return this.lastFetchedBlock
  }

  async getNewState(): Promise<L1EventStateType[]> {
    this.logger.debug('Fetching new events', {
      contractAddress: this.contractAddress.toString(),
      eventAbi: eventAbi.name,
      lastFetchedBlock: this.lastFetchedBlock.toString(),
    })

    const lastBlock = await this.client.getBlockNumber()
    const fromBlock = this.lastFetchedBlock + 1n
    const toBlock = BigInt(
      Math.min(
        Number(lastBlock - this.reorgOffset),
        Number(this.lastFetchedBlock + this.batchSize),
      ),
    )

    if (fromBlock > toBlock) {
      this.logger.debug('No new events')
      return []
    }

    const events = await this.client.getLogsInRange(
      eventAbi,
      this.contractAddress,
      fromBlock,
      toBlock,
    )

    this.logger.debug('Fetched new events', { length: events.length })

    const calldata = await this.eventsToCallData(events)
    const timestamps = await this.eventsToTimestamps(events)
    const posters = eventsToPosters(events)

    assert(
      events.length === posters.length && events.length === timestamps.length,
      'The amount of calldata is not equal to the amount of poster address or amount of timestamps',
    )

    this.lastFetchedBlock = toBlock
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
