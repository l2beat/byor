import { getChain } from '@byor/shared'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ApiServer } from './api/ApiServer'
import { createAccountRouter } from './api/routers/AccountRouter'
import { createStatisticsRouter } from './api/routers/StatisticRouter'
import { createTransactionRouter } from './api/routers/TransactionRouter'
import { AppRouters } from './api/types/AppRouter'
import { calculateTransactionLimit } from './calculateTransactionLimit'
import { Config } from './config'
import { AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'
import { FetcherRepository } from './db/FetcherRepository'
import { TransactionRepository } from './db/TransactionRepository'
import { GenesisStateLoader } from './GenesisStateLoader'
import { getContractCreationTime } from './getContractCreationTime'
import { L1StateFetcher } from './L1StateFetcher'
import { L1StateManager } from './L1StateManager'
import { L1StateSubmitter } from './L1StateSubmitter'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'
import { LogLevel } from './tools/ILogger'
import { Logger } from './tools/Logger'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const logger = new Logger({ logLevel: LogLevel.DEBUG, format: 'pretty' })

    const database = new Database(
      config.databaseConnection,
      config.migrationsPath,
      config.isProductionDatabase,
      logger,
    )
    const accountRepository = new AccountRepository(database)
    // NOTE(radomski): We store transactions only for statistics and transaction status query
    const transactionRepository = new TransactionRepository(database)
    const fetcherRepository = new FetcherRepository(
      database,
      getContractCreationTime(config),
    )

    const chain = getChain()
    const publicProvider = createPublicClient({
      chain,
      transport: http(),
    })
    const signer = createWalletClient({
      chain,
      account: privateKeyToAccount(config.privateKey.toString()),
      transport: http(),
    })
    const ethereumClient = new EthereumPrivateClient(
      signer,
      publicProvider,
      config.ctcContractAddress,
      logger,
    )

    const genesisStateLoader = new GenesisStateLoader(
      config.genesisState,
      accountRepository,
      logger,
    )
    const l1Fetcher = new L1StateFetcher(
      ethereumClient,
      fetcherRepository,
      config.ctcContractAddress,
      logger,
    )
    const l1Manager = new L1StateManager(
      config.probePeriodSec,
      accountRepository,
      transactionRepository,
      l1Fetcher,
      logger,
    )

    const mempool = new Mempool(logger)
    const transactionLimit = calculateTransactionLimit(config.gasLimit)
    const l1Submitter = new L1StateSubmitter(
      config.flushPeriodSec,
      transactionLimit,
      l1Manager,
      ethereumClient,
      mempool,
      logger,
    )

    const routers: AppRouters = {
      accounts: createAccountRouter(accountRepository),
      transactions: createTransactionRouter(mempool, transactionRepository),
      statistics: createStatisticsRouter(transactionRepository),
    }

    const apiServer = new ApiServer(config.rpcServePort, logger, routers)

    this.start = async (): Promise<void> => {
      logger.info('Starting...')

      await database.migrate()
      await l1Fetcher.start()
      await genesisStateLoader.apply()
      l1Manager.start()
      l1Submitter.start()

      apiServer.listen()
    }
  }
}
