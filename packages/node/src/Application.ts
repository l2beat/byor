import { GenesisStateMap, getGenesisState } from '@byor/shared'

import { Config } from './config'
import { AccountInsertRecord, AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'

function applyGenesisState(
  genesisState: GenesisStateMap,
  database: Database,
): void {
  const accountRepository = new AccountRepository(database)

  const accounts: AccountInsertRecord[] = Object.entries(genesisState).map(
    ([address, value]) => {
      return {
        address: address,
        balance: value,
      }
    },
  )

  accountRepository.addOrUpdateMany(accounts)
}

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
