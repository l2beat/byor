import { Hex } from '@byor/shared'

export interface Config {
  readonly rpcUrl: string
  readonly chainId: number
  readonly databasePath: string
  readonly ctcContractAddress: Hex
  readonly genesisFilePath: string
}
