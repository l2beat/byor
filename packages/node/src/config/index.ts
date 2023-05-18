import { Hex } from '@byor/shared'
import fs from 'fs'

import { Config } from './Config'

export type { Config }

interface ConfigJSON {
  RPC_URL: string
  DB_PATH: string
  CTC_CONTRACT_ADDRESS: string
  GENESIS_FILE_PATH: string
}

export function getConfig(configPath: string): Config {
  const jsonContent = fs.readFileSync(configPath, 'utf-8')
  const configJson = JSON.parse(jsonContent) as ConfigJSON

  const config: Config = {
    rpcUrl: configJson.RPC_URL,
    databasePath: configJson.DB_PATH,
    ctcContractAddress: Hex(configJson.CTC_CONTRACT_ADDRESS),
    genesisFilePath: configJson.GENESIS_FILE_PATH,
  }

  return config
}
