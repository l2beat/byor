import { EthereumClient } from './EthereumClient'
import { EthereumAddress, Hex, Logger } from '@byor/shared'
import {
  WalletClient,
  Chain,
  Account,
  createWalletClient,
  http,
  Hex as ViemHex,
  WriteContractParameters,
  Address,
  PublicClient,
} from 'viem'
import { abi } from '../../config/abi'
import { Abi } from 'abitype'

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

  async writeToCTCContract(batchBytes: Hex) {
    await this.privateProvider.writeContract({
      address: this.ctcContractAddress.toString() as ViemHex,
      abi: abi,
      functionName: 'appendBatch',
      args: [batchBytes.toString() as ViemHex],
      account: this.privateProvider.account!,
      chain: this.privateProvider.chain,
    })
  }
}
