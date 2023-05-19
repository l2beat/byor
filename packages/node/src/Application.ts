import { Config } from './config'
import { Database } from './db/Database'
import { GenesisStateLoader } from './GenesisStateLoader'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const database = new Database(config.databasePath)
    const genesisStateLoader = new GenesisStateLoader(config.genesisFilePath)

    genesisStateLoader.apply(database)

    this.start = async (): Promise<void> => {
      console.log('Starting...')
      return new Promise((resolve, _) => {
        resolve()
      })
    }
  }
}
