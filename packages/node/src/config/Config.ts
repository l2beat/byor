import { EthereumAddress, Hex } from '@byor/shared'

export interface Config {
  readonly probePeriodSec: number
  readonly flushPeriodSec: number
  readonly chainId: number
  readonly contractCreatedAtBlock: number
  readonly databaseConnection: string
  readonly migrationsPath: string
  readonly privateKey: Hex
  readonly ctcContractAddress: EthereumAddress
  readonly genesisFilePath: string
  readonly rpcServePort: number
  readonly gasLimit: number
}
