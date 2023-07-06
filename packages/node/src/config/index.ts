import { EthereumAddress, Hex } from '@byor/shared'
import fs from 'fs'
import * as z from 'zod'

import { Config } from './Config'

export type { Config }

const ConfigJSON = z.object({
  PROBE_PERIOD_SEC: z.number(),
  FLUSH_PERIOD_SEC: z.number(),
  CHAIN_ID: z.number(),
  CONTRACT_CREATED_AT_BLOCK: z.number(),
  DB_PATH: z.string(),
  DB_MIGRATIONS_PATH: z.string(),
  PRIVATE_KEY: z.string(),
  CTC_CONTRACT_ADDRESS: z.string(),
  GENESIS_FILE_PATH: z.string(),
  RPC_SERVE_PORT: z.number(),
  L1_TX_BATCH_GAS_LIMIT: z.number(),
})

export function getConfig(configPath: string): Config {
  const jsonContent = fs.readFileSync(configPath, 'utf-8')
  const configJson = ConfigJSON.parse(JSON.parse(jsonContent))

  return {
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
}
