import {
  deserializeBatch,
  EthereumAddress,
  unreachableCodePath,
} from '@byor/shared'
import { zip } from 'lodash'

import { AccountRepository } from '../peripherals/database/AccountRepository'
import {
  TransactionRecord,
  TransactionRepository,
} from '../peripherals/database/TransactionRepository'
import { setIntervalAsync } from '../tools/asyncTimeUtils'
import { Logger } from '../tools/Logger'
import { executeBatch, StateMap } from './executeBatch'
import { L1EventStateType } from './L1EventStateType'
import { L1StateFetcher } from './L1StateFetcher'

export class L1StateManager {
  private readonly probePeriodMs: number

  constructor(
    probePeriodSec: number,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly l1Fetcher: L1StateFetcher,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
    this.probePeriodMs = probePeriodSec * 1000
  }

  start(): void {
    this.logger.info('Started')
    setIntervalAsync(
      async () => this.update(),
      this.probePeriodMs,
      true,
    ).finally(unreachableCodePath)
  }

  async update(): Promise<void> {
    this.logger.info('Getting new state')
    await this.l1Fetcher
      .getNewState()
      .then((eventState) => this.apply(eventState))
      .catch((err: Error) => {
        this.logger.warn(
          'Trying to update the state using the L1 resuled in an error',
          { error: err.message },
        )
      })
  }

  async getState(): Promise<StateMap> {
    const accountState: StateMap = {}
    const accounts = await this.accountRepository.getAll()
    accounts.forEach(
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
    let accountState = await this.getState()

    for (const [batch, state] of zip(batches, l1States)) {
      // NOTE(radomski): We know that it won't be undefined
      // because of the assert at the beginning of this function
      /* eslint-disable */
      accountState = executeBatch(accountState, batch!, state!.poster)

      await this.transactionRepository.addMany(
        batch!.map((tx) => {
          return {
            from: tx.from,
            to: tx.to,
            value: tx.value,
            nonce: tx.nonce,
            fee: tx.fee,
            feeReceipent: state!.poster,
            l1SubmittedDate: state!.timestamp,
          } as TransactionRecord
        }),
      )
      /* eslint-enable */
    }

    await this.accountRepository.addOrUpdateMany(
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
