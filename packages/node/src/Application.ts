import { GenesisStateMap, getGenesisState } from '@byor/shared'

import { Config } from './config'
import { AccountInsertRecord, AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const genesisState = getGenesisState(config.genesisFilePath)
    const database = new Database(config.databasePath)

    applyGenesisState(genesisState, database)

    this.start = async (): Promise<void> => {
      console.log('Starting...')
      return new Promise((resolve, _) => {
        resolve()
      })
    }
  }
}

function applyGenesisState(
  genesisState: GenesisStateMap,
  database: Database,
): void {
  const accountRepository = new AccountRepository(database)

  const accounts: AccountInsertRecord[] = Object.entries(genesisState).map(
    ([address, balance]) => {
      return {
        address,
        balance,
      }
    },
  )

  accountRepository.addOrUpdateMany(accounts)
}
