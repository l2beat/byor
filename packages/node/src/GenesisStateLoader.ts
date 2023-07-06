import { EthereumAddress, Unsigned64 } from '@byor/shared'

import { getGenesisState } from './config/getGenesisState'
import { AccountRecord, AccountRepository } from './db/AccountRepository'
import { Logger } from './tools/Logger'

export class GenesisStateLoader {
  private readonly genesisState: Record<string, number>

  constructor(
    genesisFilePath: string,
    private readonly accountRepository: AccountRepository,
    private readonly logger: Logger,
  ) {
    this.genesisState = getGenesisState(genesisFilePath)
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
