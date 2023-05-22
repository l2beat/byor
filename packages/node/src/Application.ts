import { Config } from './config'
import { Database } from './db/Database'
import { GenesisStateLoader } from './GenesisStateLoader'
import { L1StateManager } from './L1StateManager'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const database = new Database(config.databasePath)
    const genesisStateLoader = new GenesisStateLoader(config.genesisFilePath)
    const l1Manager = new L1StateManager(config)

    genesisStateLoader.apply(database)

    this.start = async (): Promise<void> => {
      console.log('Starting...')

      await l1Manager.applyWholeState(database)
    }
  }
}
