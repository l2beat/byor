import { Logger, LogLevel } from '@byor/shared'
import { createPublicClient, http } from 'viem'

import { ApiServer } from './api/ApiServer'
import { createAccountRouter } from './api/routers/AccountRouter'
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
    const logger = new Logger({ logLevel: LogLevel.DEBUG, format: 'pretty' })

    const chain = createChain(config)
    const provider = createPublicClient({
      chain,
      transport: http(),
    })
    const ethereumClient = new EthereumClient(provider, logger)

    const genesisStateLoader = new GenesisStateLoader(
      config.genesisFilePath,
      accountRepository,
      logger,
    )
    const l1Fetcher = new L1StateFetcher(
      ethereumClient,
      config.ctcContractAddress,
      logger,
    )
    const l1Manager = new L1StateManager(accountRepository, l1Fetcher, logger)

    const routers = {
      accounts: createAccountRouter(accountRepository),
    }

    const apiServer = new ApiServer(config.rpcServePort, logger, routers)

    genesisStateLoader.apply()

    this.start = async (): Promise<void> => {
      logger.info('Starting...')

      await l1Manager.start()
      apiServer.listen()
    }
  }
}
