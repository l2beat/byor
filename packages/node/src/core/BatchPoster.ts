import { serializeBatch, unreachableCodePath } from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'

import { EthereumPrivateClient } from '../peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from '../peripherals/mempool/Mempool'
import { setIntervalAsync } from '../tools/asyncTimeUtils'
import { filterValidTxs } from './executeBatch'
import { StateUpdater } from './StateUpdater'

export class BatchPoster {
  constructor(
    private readonly stateUpdater: StateUpdater,
    private readonly client: EthereumPrivateClient,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
    private readonly transactionLimit: number,
    private readonly intervalMs: number,
  ) {
    this.logger = logger.for(this)
  }

  start(): void {
    this.logger.info('Starting')
    setIntervalAsync(async () => {
      await this.postBatch().catch((err: Error) => {
        this.logger.warn('Failed to submit batch to L1', { error: err.message })
      })
    }, this.intervalMs).finally(unreachableCodePath)
  }

  private async postBatch(): Promise<void> {
    const candidateTransactions = this.mempool.popNHighestFee(
      this.transactionLimit,
    )
    if (candidateTransactions.length === 0) {
      return
    }

    const state = await this.stateUpdater.getState()
    const validTransactions = filterValidTxs(state, candidateTransactions)

    if (validTransactions.length !== candidateTransactions.length) {
      this.logger.info('Dropped invalid transactions', {
        count: candidateTransactions.length - validTransactions.length,
        leftInMempool: this.mempool.size(),
      })
    }

    if (validTransactions.length === 0) {
      return
    }

    const batchBytes = serializeBatch(validTransactions)
    await this.client.writeToInputsContract(batchBytes)
    this.logger.info('Submitted', {
      count: candidateTransactions.length,
      leftInMempool: this.mempool.size(),
    })
  }
}
