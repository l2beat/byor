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
    probePeriodSec: 5,
    flushPeriodSec: 10,
    contractCreatedAtBlock: 9219782,
    database: {
      connection: getEnv('DATABASE_URL'),
      migrationPath: 'drizzle',
      isProduction: true,
    },
    privateKey: Hex(getEnv('PRIVATE_KEY')),
    ctcContractAddress: EthereumAddress(
      '0x1155cBF8aAf5d086051A0D5a3f1B900473d22419',
    ),
    genesisState: GENESIS_STATE,
    rpcServePort: parseInt(getEnv('PORT')),
    gasLimit: 3_000_000,
  }
}
