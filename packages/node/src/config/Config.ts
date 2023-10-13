import { EthereumAddress, Hex } from '@byor/shared'
import { Chain } from 'viem'

export interface Config {
  readonly chain: Chain
  readonly rpcUrl?: string
  readonly contractAddress: EthereumAddress
  readonly contractCreationBlock: number
  readonly batchDownloader: {
    readonly intervalMs: number
    readonly reorgOffset: bigint
    readonly maxBlocksPerQuery: bigint
  }
  readonly batchPoster: {
    readonly intervalMs: number
    readonly gasLimit: number
    readonly sequencerOrder: string
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
