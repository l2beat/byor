import { assert, EthereumAddress, Hex, Logger } from '@byor/shared'
import { zipWith } from 'lodash'
import { decodeFunctionData, GetLogsReturnType, parseAbiItem } from 'viem'

import { abi } from './config/abi'
import { L1EventStateType } from './L1EventStateType'
import { EthereumClient } from './peripherals/ethereum/EthereumClient'

const eventAbi = parseAbiItem('event BatchAppended(address sender)')
type EventAbiType = typeof eventAbi
type BatchAppendedLogsType = GetLogsReturnType<EventAbiType>

export class L1StateFetcher {
    private lastFetchedBlock: bigint;
  constructor(
    private readonly client: EthereumClient,
    private readonly contractAddress: EthereumAddress,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
        this.lastFetchedBlock = 0n;
  }

  async getWholeState(): Promise<L1EventStateType[]> {
    this.logger.debug(
      'Fetching all batch append events since the genesis block',
      {
        contractAddress: this.contractAddress.toString(),
        eventAbi: eventAbi.name,
      },
    )
    const l1State = await this.client.getLogsSinceGenesis(
      eventAbi,
      this.contractAddress,
    )
    const calldata = await this.eventsToCallData(l1State)
    const posters = eventsToPosters(l1State)

    assert(
      l1State.length === posters.length,
      'The amount of calldata is not equal to the amount of poster address',
    )

    for(const event of l1State) {
        if(event.blockNumber)  {
            this.lastFetchedBlock = this.lastFetchedBlock > event.blockNumber ? this.lastFetchedBlock : event.blockNumber;
        }
    }

    return zipWith(posters, calldata, (poster, calldata) => {
      return { poster, calldata }
    })
  }

  async getNewState(): Promise<L1EventStateType[]> {
    this.logger.debug(
      'Fetching all batch append events since the last gotten block',
      {
        contractAddress: this.contractAddress.toString(),
        eventAbi: eventAbi.name,
        lastFetchedBlock: this.lastFetchedBlock.toString(),
      },
    )

    const l1State = await this.client.getLogsInRange(
      eventAbi,
      this.contractAddress,
      this.lastFetchedBlock + 1n,
    )
    const calldata = await this.eventsToCallData(l1State)
    const posters = eventsToPosters(l1State)

    assert(
      l1State.length === posters.length,
      'The amount of calldata is not equal to the amount of poster address',
    )

    for(const event of l1State) {
        if(event.blockNumber)  {
            this.lastFetchedBlock = this.lastFetchedBlock > event.blockNumber ? this.lastFetchedBlock : event.blockNumber;
        }
    }

    return zipWith(posters, calldata, (poster, calldata) => {
      return { poster, calldata }
    })
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
}

function eventsToPosters(events: BatchAppendedLogsType): EthereumAddress[] {
  return events.map((e) => EthereumAddress(e.args.sender))
}
