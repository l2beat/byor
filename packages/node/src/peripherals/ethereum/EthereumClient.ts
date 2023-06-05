import { EthereumAddress, Hex, Logger } from '@byor/shared'
import { AbiEvent } from 'abitype'
import {
  GetLogsReturnType,
  Hex as ViemHex,
  PublicClient,
  Transaction,
} from 'viem'

export class EthereumClient {
  constructor(
    private readonly publicProvider: PublicClient,
    protected logger: Logger,
  ) {
    this.logger = this.logger.for(this)
  }

  async getLogsInRange<TAbiEvent extends AbiEvent>(
    abi: TAbiEvent,
    contractAddress: EthereumAddress,
    fromBlock: bigint,
    toBlock?: bigint,
  ): Promise<GetLogsReturnType<TAbiEvent>> {
    this.logger.debug('Getting event logs in range', {
      abi: abi.name,
      contractAddress: contractAddress.toString(),
      fromBlock: fromBlock.toString(),
      toBlock: toBlock ? toBlock.toString() : 'NONE',
    })

    const result = await this.publicProvider.getLogs({
      address: contractAddress.toString() as ViemHex,
      event: abi,
      fromBlock: fromBlock,
      toBlock: toBlock,
    })

    return result
  }

  async getLogsSinceGenesis<TAbiEvent extends AbiEvent>(
    abi: TAbiEvent,
    contractAddress: EthereumAddress,
  ): Promise<GetLogsReturnType<TAbiEvent>> {
    return this.getLogsInRange(abi, contractAddress, 0n)
  }

  async getTransaction(hash: Hex): Promise<Transaction> {
    const result = this.publicProvider.getTransaction({
      hash: hash.toString() as ViemHex,
    })

    return result
  }

  getChainId(): number {
    // NOTE(radomski): If this fires, the design of interaction with
    // L1 changed, so this is no longer valid
    // eslint-disable-next-line
    return this.publicProvider.chain!.id
  }
}
