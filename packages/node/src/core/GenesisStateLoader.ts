import { EthereumAddress, Unsigned64 } from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'

import {
  AccountRecord,
  AccountRepository,
} from '../peripherals/database/AccountRepository'

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
      this.logger.info('Genesis state already applied, skipping')
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

    await this.accountRepository.addOrUpdateMany(accounts)
    this.logger.info('Applied genesis state', this.genesisState)
  }
}
