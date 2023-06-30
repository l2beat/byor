import { Config } from './Config'

export interface ChainContractCreationTime {
  chainId: number
  contractCreatedAtBlock: number
}

export function getContractCreationTime(
  config: Config,
): ChainContractCreationTime {
  return {
    chainId: config.chainId,
    contractCreatedAtBlock: config.contractCreatedAtBlock,
  }
}
