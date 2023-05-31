import { EthereumAddress, Hex, Logger } from '@byor/shared'
import { Hex as ViemHex, PublicClient, WalletClient } from 'viem'

import { abi } from '../../config/abi'
import { EthereumClient } from './EthereumClient'

export class EthereumPrivateClient extends EthereumClient {
  constructor(
    private readonly privateProvider: WalletClient,
    publicProvider: PublicClient,
    private readonly ctcContractAddress: EthereumAddress,
    logger: Logger,
  ) {
    super(publicProvider, logger)
    this.logger = this.logger.for(this)
  }

  async writeToCTCContract(batchBytes: Hex): Promise<void> {
    await this.privateProvider.writeContract({
      address: this.ctcContractAddress.toString() as ViemHex,
      abi: abi,
      functionName: 'appendBatch',
      args: [batchBytes.toString() as ViemHex],
      // NOTE(radomski): ESLint is not that smart unfortunately :(
      // eslint-disable-next-line
      account: this.privateProvider.account!,
      chain: this.privateProvider.chain,
    })
  }
}
