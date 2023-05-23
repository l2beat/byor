import {
  EthereumAddress,
  GenesisStateMap,
  getGenesisState,
  Unsigned64,
} from '@byor/shared'

import { AccountRecord, AccountRepository } from './db/AccountRepository'

export class GenesisStateLoader {
  private readonly genesisState: GenesisStateMap
  private readonly accountRepository: AccountRepository

  constructor(genesisFilePath: string, accountRepository: AccountRepository) {
    this.genesisState = getGenesisState(genesisFilePath)
    this.accountRepository = accountRepository
  }

  apply(): void {
    if (this.accountRepository.getCount() !== 0) {
      return
    }

    const accounts: AccountRecord[] = Object.entries(this.genesisState).map(
      ([address, balance]) => {
        return {
          address: EthereumAddress(address),
          balance: Unsigned64(balance),
          nonce: Unsigned64(0),
        }
      },
    )

    this.accountRepository.addOrUpdateMany(accounts)
  }
}
