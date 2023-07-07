import { EthereumAddress, Hex } from '@byor/shared'
import { config as dotenv } from 'dotenv'

import { Config } from './Config'
import GENESIS_STATE from './genesis.json'

export function getLocalConfig(): Config {
  dotenv()

  return {
    probePeriodSec: 5,
    flushPeriodSec: 10,
    chainId: 31337,
    contractCreatedAtBlock: 0,
    databaseConnection:
      process.env.LOCAL_DB_URL ??
      'postgresql://postgres:password@localhost:5432/byor_local',
    migrationsPath: 'drizzle',
    isProductionDatabase: false,
    privateKey: Hex(
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    ),
    ctcContractAddress: EthereumAddress(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    ),
    genesisState: GENESIS_STATE,
    rpcServePort: 3000,
    gasLimit: 3_000_000,
  }
}
