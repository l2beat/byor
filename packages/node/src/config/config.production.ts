import { EthereumAddress, Hex } from '@byor/shared'
import { config as dotenv } from 'dotenv'
import { holesky } from 'viem/chains'

import { Config } from './Config'
import GENESIS_STATE from './genesis.json'
import { getEnv } from './getEnv'

export function getProductionConfig(): Config {
  dotenv()

  return {
    chain: {
      ...holesky,
      rpcUrls: {
        default: {
          http: ['https://ethereum-holesky.publicnode.com'],
        },
        public: {
          http: ['https://ethereum-holesky.publicnode.com'],
        },
      },
    },
    rpcUrl: getEnv('RPC_URL'),
    contractAddress: EthereumAddress(
      '0x1c292ae278dCf230e9D31F39F3c1b088f5d72ca0',
    ),
    contractCreationBlock: 44830,
    batchDownloader: {
      intervalMs: 5_000,
      reorgOffset: 15n,
      maxBlocksPerQuery: 10_000n,
    },
    batchPoster: {
      intervalMs: 10_000,
      gasLimit: 3_000_000,
    },
    privateKey: Hex(getEnv('PRIVATE_KEY')),
    genesisState: GENESIS_STATE,
    database: {
      connection: getEnv('DATABASE_URL'),
      migrationPath: 'drizzle',
      isProduction: true,
    },
    apiPort: parseInt(getEnv('PORT')),
  }
}
