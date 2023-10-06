import { Logger } from '@l2beat/backend-tools'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ApiServer } from './api/ApiServer'
import { createAccountRouter } from './api/routers/AccountRouter'
import { createStatisticsRouter } from './api/routers/StatisticRouter'
import { createTransactionRouter } from './api/routers/TransactionRouter'
import { AppRouters } from './api/types/AppRouter'
import { Config } from './config'
import { BatchDownloader } from './core/BatchDownloader'
import { BatchPoster } from './core/BatchPoster'
import { calculateTransactionLimit } from './core/calculateTransactionLimit'
import { GenesisStateLoader } from './core/GenesisStateLoader'
import { StateUpdater } from './core/StateUpdater'
import { AccountRepository } from './peripherals/database/AccountRepository'
import { FetcherRepository } from './peripherals/database/FetcherRepository'
import { getContractCreationTime } from './peripherals/database/getContractCreationTime'
import { Database } from './peripherals/database/shared/Database'
import { TransactionRepository } from './peripherals/database/TransactionRepository'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const logger = new Logger({
      logLevel: 'DEBUG',
      format: 'pretty',
      colors: true,
    })

    const database = new Database(
      config.database.connection,
      config.database.migrationPath,
      config.database.isProduction,
      logger,
    )
    const accountRepository = new AccountRepository(database)
    // NOTE(radomski): We store transactions only for statistics and transaction status query
    const transactionRepository = new TransactionRepository(database)
    const fetcherRepository = new FetcherRepository(
      database,
      getContractCreationTime(config),
    )

    const publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl),
    })
    const walletClient = createWalletClient({
      chain: config.chain,
      account: privateKeyToAccount(config.privateKey.toString()),
      transport: http(config.rpcUrl),
    })
    const ethereumClient = new EthereumPrivateClient(
      walletClient,
      publicClient,
      config.contractAddress,
      logger,
    )

    const genesisStateLoader = new GenesisStateLoader(
      config.genesisState,
      accountRepository,
      logger,
    )
    const batchDownloader = new BatchDownloader(
      ethereumClient,
      fetcherRepository,
      config.contractAddress,
      logger,
      config.batchDownloader.reorgOffset,
      config.batchDownloader.maxBlocksPerQuery,
    )
    const stateUpdater = new StateUpdater(
      accountRepository,
      transactionRepository,
      batchDownloader,
      logger,
      config.batchDownloader.intervalMs,
    )

    const mempool = new Mempool(logger)
    const batchPoster = new BatchPoster(
      stateUpdater,
      ethereumClient,
      mempool,
      logger,
      calculateTransactionLimit(config.batchPoster.gasLimit),
      config.batchPoster.intervalMs,
    )

    const routers: AppRouters = {
      accounts: createAccountRouter(accountRepository),
      transactions: createTransactionRouter(mempool, transactionRepository),
      statistics: createStatisticsRouter(transactionRepository),
    }

    const apiServer = new ApiServer(config.apiPort, logger, routers)

    this.start = async (): Promise<void> => {
      logger.for(this).info('Starting...')

      await database.migrate()
      await batchDownloader.start()
      await genesisStateLoader.apply()
      stateUpdater.start()
      batchPoster.start()

      apiServer.listen()
    }
  }
}
