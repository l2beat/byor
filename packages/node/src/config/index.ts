import { EthereumAddress, Hex } from '@byor/shared'
import fs from 'fs'

import { Config } from './Config'

export type { Config }

interface ConfigJSON {
  PROBE_PERIOD_SEC: number
  FLUSH_PERIOD_SEC: number
  CHAIN_ID: number
  CONTRACT_CREATED_AT_BLOCK: number
  DB_PATH: string
  DB_MIGRATIONS_PATH: string
  PRIVATE_KEY: string
  CTC_CONTRACT_ADDRESS: string
  GENESIS_FILE_PATH: string
  RPC_SERVE_PORT: number
  L1_TX_BATCH_GAS_LIMIT: number
}

export function getConfig(configPath: string): Config {
  const jsonContent = fs.readFileSync(configPath, 'utf-8')
  const configJson = JSON.parse(jsonContent) as ConfigJSON

  const config: Config = {
    probePeriodSec: configJson.PROBE_PERIOD_SEC,
    flushPeriodSec: configJson.FLUSH_PERIOD_SEC,
    chainId: configJson.CHAIN_ID,
    contractCreatedAtBlock: configJson.CONTRACT_CREATED_AT_BLOCK,
    databasePath: configJson.DB_PATH,
    migrationsPath: configJson.DB_MIGRATIONS_PATH,
    privateKey: Hex(configJson.PRIVATE_KEY),
    ctcContractAddress: EthereumAddress(configJson.CTC_CONTRACT_ADDRESS),
    genesisFilePath: configJson.GENESIS_FILE_PATH,
    rpcServePort: configJson.RPC_SERVE_PORT,
    gasLimit: configJson.L1_TX_BATCH_GAS_LIMIT,
  }

  return config
}
