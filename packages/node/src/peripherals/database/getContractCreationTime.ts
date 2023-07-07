import { Config } from '../../config/Config'

export interface ChainContractCreationTime {
  chainId: number
  contractCreatedAtBlock: number
}

export function getContractCreationTime(
  config: Config,
): ChainContractCreationTime {
  return {
    chainId: config.chain.id,
    contractCreatedAtBlock: config.contractCreatedAtBlock,
  }
}
