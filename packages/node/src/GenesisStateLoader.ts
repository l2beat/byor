import { GenesisStateMap, getGenesisState } from '@byor/shared'

import { AccountInsertRecord, AccountRepository } from './db/AccountRepository'
import { Database } from './db/Database'

export class GenesisStateLoader {
  readonly genesisState: GenesisStateMap

  constructor(genesisFilePath: string) {
    this.genesisState = getGenesisState(genesisFilePath)
  }

  apply(database: Database): void {
    const accountRepository = new AccountRepository(database)
    if (accountRepository.getCount() !== 0) {
      return
    }

    const accounts: AccountInsertRecord[] = Object.entries(
      this.genesisState,
    ).map(([address, balance]) => {
      return {
        address,
        balance,
      }
    })

    accountRepository.addOrUpdateMany(accounts)
  }
}
