import { serializeBatch, unreachableCodePath } from '@byor/shared'

import { filterValidTxs } from './executeBatch'
import { L1StateManager } from './L1StateManager'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'
import { setIntervalAsync } from './tools/asyncTimeUtils'
import { Logger } from './tools/Logger'

export class L1StateSubmitter {
  constructor(
    private readonly flushPeriodSec: number,
    private readonly transactionLimit: number,
    private readonly l1StateManager: L1StateManager,
    private readonly client: EthereumPrivateClient,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
  }

  start(): void {
    this.logger.info('Starting')
    setIntervalAsync(async () => {
      await this.mempoolSubmit().catch((err: Error) => {
        this.logger.warn('Failed to submit batch to L1', { error: err.message })
      })
    }, this.flushPeriodSec * 1000).finally(unreachableCodePath)
  }

  private async mempoolSubmit(): Promise<void> {
    const transactions = this.mempool.popNHighestFee(this.transactionLimit)
    this.logger.info('Submitting', {
      transactionsLength: transactions.length,
    })

    if (transactions.length > 0) {
      const state = this.l1StateManager.getState()

      const validTxs = filterValidTxs(state, transactions)
      if (validTxs.length > 0) {
        const batchBytes = serializeBatch(validTxs)
        await this.client.writeToCTCContract(batchBytes)
      }
    }
  }
}
