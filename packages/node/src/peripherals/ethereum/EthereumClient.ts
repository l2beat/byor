import { EthereumAddress, Hex, Logger } from '@byor/shared'
import { AbiEvent } from 'abitype'
import {
  GetBlockReturnType,
  GetLogsReturnType,
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
    this.logger.debug('Getting range', {
      abi: abi.name,
      contractAddress: contractAddress.toString(),
      fromBlock: fromBlock.toString(),
      toBlock: toBlock ? toBlock.toString() : 'NONE',
    })

    try {
      return await this.publicProvider.getLogs({
        address: contractAddress.toString(),
        event: abi,
        fromBlock: fromBlock,
        toBlock: toBlock,
      })
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.includes('Log response size exceeded') ||
          e.message.includes('block range is too wide'))
      ) {
        let end = toBlock ? toBlock : await this.publicProvider.getBlockNumber()
        end = end < fromBlock ? fromBlock : end
        const midPoint =
          Number(fromBlock) + Math.floor(Number((end - fromBlock) / 2n))
        const [a, b] = await Promise.all([
          this.getLogsInRange(
            abi,
            contractAddress,
            fromBlock,
            BigInt(midPoint),
          ),
          this.getLogsInRange(
            abi,
            contractAddress,
            BigInt(midPoint + 1),
            toBlock,
          ),
        ])
        return a.concat(b)
      } else {
        throw e
      }
    }
  }

  async getTransaction(hash: Hex): Promise<Transaction> {
    const result = this.publicProvider.getTransaction({
      hash: hash.toString(),
    })

    return result
  }

  async getBlockHeader(hash: Hex): Promise<GetBlockReturnType> {
    const result = this.publicProvider.getBlock({
      blockHash: hash.toString(),
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
