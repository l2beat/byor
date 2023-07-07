import { EthereumAddress, Hex } from '@byor/shared'
import { Chain } from 'viem'

export interface Config {
  readonly chain: Chain
  readonly rpcUrl?: string
  readonly contractAddress: EthereumAddress
  readonly contractCreationBlock: number
  readonly eventQuery: {
    readonly intervalMs: number
    readonly reorgOffset: bigint
    readonly batchSize: bigint
  }
  readonly batchPosting: {
    readonly intervalMs: number
    readonly gasLimit: number
  }
  readonly privateKey: Hex
  readonly genesisState: Record<string, number>
  readonly database: {
    readonly connection: string
    readonly migrationPath: string
    readonly isProduction: boolean
  }
  readonly apiPort: number
}
