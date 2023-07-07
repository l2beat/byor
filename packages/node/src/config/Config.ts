import { EthereumAddress, Hex } from '@byor/shared'
import { Chain } from 'viem'

export interface Config {
  readonly chain: Chain
  readonly probePeriodSec: number
  readonly flushPeriodSec: number
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
