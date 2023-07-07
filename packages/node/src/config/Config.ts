import { EthereumAddress, Hex } from '@byor/shared'
import { Chain } from 'viem'

export interface Config {
  readonly chain: Chain
  readonly rpcUrl?: string
  readonly contractAddress: EthereumAddress
  readonly contractCreationBlock: number
  readonly eventQueryIntervalSeconds: number
  readonly batchPostingIntervalSeconds: number
  readonly batchPostingGasLimit: number
  readonly privateKey: Hex
  readonly genesisState: Record<string, number>
  readonly database: {
    readonly connection: string
    readonly migrationPath: string
    readonly isProduction: boolean
  }
  readonly apiPort: number
}
