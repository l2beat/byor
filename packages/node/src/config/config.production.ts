import { EthereumAddress, Hex } from '@byor/shared'
import { config as dotenv } from 'dotenv'

import { Config } from './Config'
import GENESIS_STATE from './genesis.json'
import { getEnv } from './getEnv'

export function getProductionConfig(): Config {
  dotenv()

  return {
    probePeriodSec: 5,
    flushPeriodSec: 10,
    chainId: 31337,
    contractCreatedAtBlock: 9219782,
    databaseConnection: getEnv('DATABASE_URL'),
    migrationsPath: 'drizzle',
    isProductionDatabase: true,
    privateKey: Hex(getEnv('PRIVATE_KEY')),
    ctcContractAddress: EthereumAddress(getEnv('CTC_ADDRESS')),
    genesisState: GENESIS_STATE,
    rpcServePort: 3000,
    gasLimit: 3_000_000,
  }
}
