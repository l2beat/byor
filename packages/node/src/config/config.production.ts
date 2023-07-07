import { EthereumAddress, Hex } from '@byor/shared'
import { config as dotenv } from 'dotenv'
import { goerli } from 'viem/chains'

import { Config } from './Config'
import GENESIS_STATE from './genesis.json'
import { getEnv } from './getEnv'

export function getProductionConfig(): Config {
  dotenv()

  return {
    chain: goerli,
    rpcUrl: getEnv('RPC_URL'),
    contractAddress: EthereumAddress(
      '0x1155cBF8aAf5d086051A0D5a3f1B900473d22419',
    ),
    contractCreationBlock: 9219782,
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
