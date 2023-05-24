import { EthereumAddress, Hex } from '@byor/shared'
import { AbiEvent } from 'abitype'
import {
  GetLogsReturnType,
  Hex as ViemHex,
  PublicClient,
  Transaction,
} from 'viem'

export class EthereumClient {
  private readonly provider: PublicClient

  constructor(provider: PublicClient) {
    this.provider = provider
  }

  async getLogsInRange<TAbiEvent extends AbiEvent>(
    abi: TAbiEvent,
    contractAddress: EthereumAddress,
    fromBlock: bigint,
    toBlock?: bigint,
  ): Promise<GetLogsReturnType<TAbiEvent>> {
    const result = await this.provider.getLogs({
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
    const result = this.provider.getTransaction({
      hash: hash.toString() as ViemHex,
    })

    return result
  }
}
