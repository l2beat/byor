import { EthereumAddress, Hex, localNetwork } from '@byor/shared'
import { config as dotenv } from 'dotenv'

import { Config } from './Config'
import GENESIS_STATE from './genesis.json'

export function getLocalConfig(): Config {
  dotenv()

  return {
    chain: localNetwork,
    rpcUrl: process.env.LOCAL_RPC_URL ?? 'http://127.0.0.1:8545',
    contractAddress: EthereumAddress(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    ),
    contractCreationBlock: 0,
    batchDownloader: {
      intervalMs: 5_000,
      reorgOffset: 0n,
      maxBlocksPerQuery: 10n,
    },
    batchPoster: {
      intervalMs: 10_000,
      gasLimit: 3_000_000,
    },
    privateKey: Hex(
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    ),
    genesisState: GENESIS_STATE,
    database: {
      connection:
        process.env.LOCAL_DB_URL ??
        'postgresql://postgres:password@localhost:5432/byor_local',
      migrationPath: 'drizzle',
      isProduction: false,
    },
    apiPort: 3000,
  }
}
