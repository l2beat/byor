import { EthereumAddress } from '@byor/shared'
import fs from 'fs'

import { Config } from './Config'

export * from './createChain'

export type { Config }

interface ConfigJSON {
  RPC_URL: string
  CHAIN_ID: number
  DB_PATH: string
  CTC_CONTRACT_ADDRESS: string
  GENESIS_FILE_PATH: string
}

export function getConfig(configPath: string): Config {
  const jsonContent = fs.readFileSync(configPath, 'utf-8')
  const configJson = JSON.parse(jsonContent) as ConfigJSON

  const config: Config = {
    rpcUrl: configJson.RPC_URL,
    chainId: configJson.CHAIN_ID,
    databasePath: configJson.DB_PATH,
    ctcContractAddress: EthereumAddress(configJson.CTC_CONTRACT_ADDRESS),
    genesisFilePath: configJson.GENESIS_FILE_PATH,
  }

  return config
}
