import { EthereumAddress, Hex } from '@byor/shared'

export interface Config {
  readonly probePeriodSec: number
  readonly flushPeriodSec: number
  readonly rpcUrl: string
  readonly chainId: number
  readonly databasePath: string
  readonly privateKey: Hex
  readonly ctcContractAddress: EthereumAddress
  readonly genesisFilePath: string
  readonly rpcServePort: number
  readonly gasLimit: number
}
