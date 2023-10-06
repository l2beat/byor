import {
  deserializeBatch,
  EthereumAddress,
  unreachableCodePath,
} from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'
import { zip } from 'lodash'

import { AccountRepository } from '../peripherals/database/AccountRepository'
import {
  TransactionRecord,
  TransactionRepository,
} from '../peripherals/database/TransactionRepository'
import { setIntervalAsync } from '../tools/asyncTimeUtils'
import { Batch, BatchDownloader } from './BatchDownloader'
import { executeBatch, StateMap } from './executeBatch'

export class StateUpdater {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly batchDownloader: BatchDownloader,
    private readonly logger: Logger,
    private readonly intervalMs: number,
  ) {
    this.logger = logger.for(this)
  }

  start(): void {
    this.logger.info('Started')
    setIntervalAsync(async () => this.update(), this.intervalMs, true).finally(
      unreachableCodePath,
    )
  }

  async update(): Promise<void> {
    this.logger.info('Getting new state')
    await this.batchDownloader
      .getNewBatches()
      .then((events) => this.apply(events))
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

  private async apply(l1States: Batch[]): Promise<void> {
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
