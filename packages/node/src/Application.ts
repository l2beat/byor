import { Logger, LogLevel } from '@byor/shared'
import {
  createPublicClient,
  createWalletClient,
  Hex as ViemHex,
  http,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ApiServer } from './api/ApiServer'
import { createAccountRouter } from './api/routers/AccountRouter'
import { createTransactionRouter } from './api/routers/TransactionRouter'
import { Config, createChain } from './config'
import { AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'
import { GenesisStateLoader } from './GenesisStateLoader'
import { L1StateFetcher } from './L1StateFetcher'
import { L1StateManager } from './L1StateManager'
import { L1StateSubmitter } from './L1StateSubmitter'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const database = new Database(config.databasePath)
    const accountRepository = new AccountRepository(database)
    const logger = new Logger({ logLevel: LogLevel.DEBUG, format: 'pretty' })

    const chain = createChain(config.chainId, config.rpcUrl)
    const publicProvider = createPublicClient({
      chain,
      transport: http(),
    })
    const signer = createWalletClient({
      chain,
      account: privateKeyToAccount(config.privateKey.toString() as ViemHex),
      transport: http(),
    })
    const ethereumClient = new EthereumPrivateClient(
      signer,
      publicProvider,
      config.ctcContractAddress,
      logger,
    )

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
    const l1Manager = new L1StateManager(
      config.probePeriodSec,
      accountRepository,
      l1Fetcher,
      logger,
    )

    const mempool = new Mempool(logger)
    const l1Submitter = new L1StateSubmitter(
      config.flushPeriodSec,
      l1Manager,
      ethereumClient,
      mempool,
      logger,
    )

    const routers = {
      accounts: createAccountRouter(accountRepository),
      transactions: createTransactionRouter(mempool),
    }

    const apiServer = new ApiServer(config.rpcServePort, logger, routers)

    genesisStateLoader.apply()

    this.start = async (): Promise<void> => {
      logger.info('Starting...')

      await l1Manager.start()
      l1Submitter.start()

      apiServer.listen()
    }
  }
}
