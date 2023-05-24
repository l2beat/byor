import { createPublicClient, http } from 'viem'

import { Config, createChain } from './config'
import { AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'
import { GenesisStateLoader } from './GenesisStateLoader'
import { L1StateFetcher } from './L1StateFetcher'
import { L1StateManager } from './L1StateManager'
import { EthereumClient } from './peripherals/ethereum/EthereumClient'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const database = new Database(config.databasePath)
    const accountRepository = new AccountRepository(database)

    const chain = createChain(config)
    const provider = createPublicClient({
      chain,
      transport: http(),
    })
    const ethereumClient = new EthereumClient(provider)

    const genesisStateLoader = new GenesisStateLoader(
      config.genesisFilePath,
      accountRepository,
    )
    const l1Fetcher = new L1StateFetcher(
      ethereumClient,
      config.ctcContractAddress,
    )
    const l1Manager = new L1StateManager(accountRepository, l1Fetcher)

    genesisStateLoader.apply()

    this.start = async (): Promise<void> => {
      console.log('Starting...')

      await l1Manager.start()
    }
  }
}
