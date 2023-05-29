import {
  deserializeBatch,
  EthereumAddress,
  Logger,
  setIntervalAsync,
  unreachableCodePath,
} from '@byor/shared'
import { zip } from 'lodash'
import { EventEmitter } from 'stream'

import { AccountRepository } from './db/AccountRepository'
import { executeBatch, StateMap } from './executeBatch'
import { L1EventStateType } from './L1EventStateType'
import { L1StateFetcher } from './L1StateFetcher'

export const TRANSACTIONS_COMMITED_EVENT = 'TRANSACTIONS_COMMITED_EVENT'

export class L1StateManager extends EventEmitter {
  private readonly probePeriodMs: number

  constructor(
    probePeriodSec: number,
    private readonly accountRepository: AccountRepository,
    private readonly l1Fetcher: L1StateFetcher,
    private readonly logger: Logger,
  ) {
    super()
    this.logger = logger.for(this)
    this.probePeriodMs = probePeriodSec * 1000
  }

  async start(): Promise<void> {
    this.logger.info('Starting')

    const eventState = await this.l1Fetcher.getWholeState()
    await this.apply(eventState)

    setIntervalAsync(async () => {
      await this.l1Fetcher
        .getNewState()
        .then((eventState) => {
          return this.apply(eventState)
        })
        .catch((err: Error) => {
          this.logger.warn(
            'Trying to update the state using the L1 resuled in an error',
            {
              error: err.message,
            },
          )
        })
    }, this.probePeriodMs).catch((_) => {
      unreachableCodePath()
    })
  }

  getState(): StateMap {
    const accountState: StateMap = {}
    this.accountRepository.getAll().forEach(
      (acc) =>
        (accountState[acc.address.toString()] = {
          balance: acc.balance,
          nonce: acc.nonce,
        }),
    )

    return accountState
  }

  private async apply(l1States: L1EventStateType[]): Promise<void> {
    if (l1States.length === 0) {
      return
    }

    this.logger.debug('Applying events', {
      eventCount: l1States.length,
    })
    const batches = await Promise.all(
      l1States.map((state) => deserializeBatch(state.calldata)),
    )
    let accountState = this.getState()

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

    this.emit(TRANSACTIONS_COMMITED_EVENT)
  }
}
