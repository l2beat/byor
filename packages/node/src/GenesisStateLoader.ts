import {
  EthereumAddress,
  GenesisStateMap,
  getGenesisState,
  Logger,
  Unsigned64,
} from '@byor/shared'

import { AccountRecord, AccountRepository } from './db/AccountRepository'

export class GenesisStateLoader {
  private readonly genesisState: GenesisStateMap

  constructor(
    genesisFilePath: string,
    private readonly accountRepository: AccountRepository,
    private readonly logger: Logger,
  ) {
    this.genesisState = getGenesisState(genesisFilePath)
    this.logger = logger.for(this)
  }

  apply(): void {
    if (this.accountRepository.getCount() !== 0) {
      this.logger.debug('Genesis state already applied, skipping')
      return
    }

    this.logger.debug('Applying genesis state', this.genesisState)
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
