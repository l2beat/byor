import { EthereumAddress } from '@byor/shared'

export interface Config {
  readonly probePeriodSec: number
  readonly flushPeriodSec: number
  readonly rpcUrl: string
  readonly chainId: number
  readonly databasePath: string
  readonly ctcContractAddress: EthereumAddress
  readonly genesisFilePath: string
  readonly rpcServePort: number
}
