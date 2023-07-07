import { EthereumAddress, Hex } from '@byor/shared'
import { Chain } from 'viem'

export interface Config {
  readonly chain: Chain
  readonly rpcUrl?: string
  readonly probePeriodSec: number
  readonly flushPeriodSec: number
  readonly contractCreatedAtBlock: number
  readonly database: {
    readonly connection: string
    readonly migrationPath: string
    readonly isProduction: boolean
  }
  readonly privateKey: Hex
  readonly ctcContractAddress: EthereumAddress
  readonly genesisState: Record<string, number>
  readonly rpcServePort: number
  readonly gasLimit: number
}
