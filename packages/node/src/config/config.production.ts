import { EthereumAddress, Hex } from '@byor/shared'
import { getEnv } from '@l2beat/backend-tools'
import { holesky } from 'viem/chains'

import { Config } from './Config'
import GENESIS_STATE from './genesis.json'

export function getProductionConfig(): Config {
  const env = getEnv()

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
    rpcUrl: env.string('RPC_URL'),
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
      sequencerOrder: env.string('SEQUENCER_ORDER', 'FEE'),
    },
    privateKey: Hex(env.string('PRIVATE_KEY')),
    genesisState: GENESIS_STATE,
    database: {
      connection: env.string('DATABASE_URL'),
      migrationPath: 'drizzle',
      isProduction: true,
    },
    apiPort: env.integer('PORT'),
  }
}
