import { Hex, Logger, setIntervalAsync } from '@byor/shared'

import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'

export class L1StateSubmitter {
  constructor(
    private readonly flushPeriodSec: number,
    private readonly client: EthereumPrivateClient,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
  }

  start(): void {
    this.logger.info('Starting')
    setIntervalAsync(
      () => {
        return this.mempoolSubmit()
      },
      this.flushPeriodSec * 1000,
      this.logger,
    ).catch((err) => {
      this.logger.error(err)
    })
  }

  private async mempoolSubmit(): Promise<void> {
    const transactions = this.mempool.getTransactionsInPool()
    this.logger.info('Submitting mempool state to L1', {
      transactionsLength: transactions.length,
    })
    this.mempool.empty()
    if (transactions.length > 0) {
      const batch = transactions.reduce(Hex.concat)
      await this.client.writeToCTCContract(batch)
    }
  }
}
