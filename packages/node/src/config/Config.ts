import { EthereumAddress } from '@byor/shared'

export interface Config {
  readonly rpcUrl: string
  readonly chainId: number
  readonly databasePath: string
  readonly ctcContractAddress: EthereumAddress
  readonly genesisFilePath: string
}
