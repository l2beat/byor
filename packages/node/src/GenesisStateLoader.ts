import { EthereumAddress, Unsigned64 } from '@byor/shared'

import { AccountRecord, AccountRepository } from './db/AccountRepository'
import { Logger } from './tools/Logger'

export class GenesisStateLoader {
  constructor(
    private readonly genesisState: Record<string, number>,
    private readonly accountRepository: AccountRepository,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
  }

  async apply(): Promise<void> {
    const count = await this.accountRepository.getCount()
    if (count !== 0) {
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

    await this.accountRepository.addOrUpdateMany(accounts)
  }
}
