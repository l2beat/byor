import { EthereumAddress, Hex } from '@byor/shared'

export interface Config {
  readonly probePeriodSec: number
  readonly flushPeriodSec: number
  readonly chainId: number
  readonly contractCreatedAtBlock: number
  readonly databaseConnection: string
  readonly migrationsPath: string
  readonly isProductionDatabase: boolean
  readonly privateKey: Hex
  readonly ctcContractAddress: EthereumAddress
  readonly genesisState: Record<string, number>
  readonly rpcServePort: number
  readonly gasLimit: number
}
