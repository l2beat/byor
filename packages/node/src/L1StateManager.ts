import { deserializeBatch, EthereumAddress, Logger } from '@byor/shared'
import { zip } from 'lodash'

import { AccountRepository } from './db/AccountRepository'
import { executeBatch, StateMap } from './executeBatch'
import { L1EventStateType } from './L1EventStateType'
import { L1StateFetcher } from './L1StateFetcher'

export class L1StateManager {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly l1Fetcher: L1StateFetcher,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
  }

  async start(): Promise<void> {
    this.logger.info('Starting')

    const eventState = await this.l1Fetcher.getWholeState()
    await this.apply(eventState)
  }

  private async apply(l1States: L1EventStateType[]): Promise<void> {
    this.logger.debug('Applying events', {
      eventCount: l1States.length,
    })
    const batches = await Promise.all(
      l1States.map((state) => deserializeBatch(state.calldata)),
    )

    let accountState: StateMap = {}
    this.accountRepository.getAll().forEach(
      (acc) =>
        (accountState[acc.address.toString()] = {
          balance: acc.balance,
          nonce: acc.nonce,
        }),
    )

    for (const [batch, state] of zip(batches, l1States)) {
      // NOTE(radomski): We know that it won't be undefined
      // because of the assert at the beginning of this function
      // eslint-disable-next-line
      accountState = executeBatch(accountState, batch!, state!.poster)
    }

    this.accountRepository.addOrUpdateMany(
      Object.entries(accountState).map(([address, value]) => {
        return {
          address: EthereumAddress(address),
          balance: value.balance,
          nonce: value.nonce,
        }
      }),
    )
  }
}
