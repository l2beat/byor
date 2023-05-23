import { Config } from './config'
import { AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'
import { GenesisStateLoader } from './GenesisStateLoader'
import { L1StateManager } from './L1StateManager'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const database = new Database(config.databasePath)
    const accountRepository = new AccountRepository(database)
    const genesisStateLoader = new GenesisStateLoader(
      config.genesisFilePath,
      accountRepository,
    )
    const l1Manager = new L1StateManager(config, accountRepository)

    genesisStateLoader.apply()

    this.start = async (): Promise<void> => {
      console.log('Starting...')

      await l1Manager.applyWholeState()
    }
  }
}
