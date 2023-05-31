import { EthereumAddress, Hex } from '@byor/shared'
import fs from 'fs'

import { Config } from './Config'

export * from './createChain'

export type { Config }

interface ConfigJSON {
  PROBE_PERIOD_SEC: number
  FLUSH_PERIOD_SEC: number
  RPC_URL: string
  CHAIN_ID: number
  DB_PATH: string
  PRIVATE_KEY: string
  CTC_CONTRACT_ADDRESS: string
  GENESIS_FILE_PATH: string
  RPC_SERVE_PORT: number
}

export function getConfig(configPath: string): Config {
  const jsonContent = fs.readFileSync(configPath, 'utf-8')
  const configJson = JSON.parse(jsonContent) as ConfigJSON

  const config: Config = {
    probePeriodSec: configJson.PROBE_PERIOD_SEC,
    flushPeriodSec: configJson.FLUSH_PERIOD_SEC,
    rpcUrl: configJson.RPC_URL,
    chainId: configJson.CHAIN_ID,
    databasePath: configJson.DB_PATH,
    privateKey: Hex(configJson.PRIVATE_KEY),
    ctcContractAddress: EthereumAddress(configJson.CTC_CONTRACT_ADDRESS),
    genesisFilePath: configJson.GENESIS_FILE_PATH,
    rpcServePort: configJson.RPC_SERVE_PORT,
  }

  return config
}
