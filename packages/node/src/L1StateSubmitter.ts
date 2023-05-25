import { Hex, Logger } from '@byor/shared'

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
    setInterval(() => {
      this.mempoolSubmit().catch((err) => {
        this.logger.error(err)
      })
    }, this.flushPeriodSec * 1000)
  }

  private async mempoolSubmit(): Promise<void> {
    const transactions = this.mempool.getTransactionsInPool()
    this.logger.info('Submitting mempool state to L1', {
      transactionsLength: transactions.length,
    })
    this.mempool.empty()
    if (transactions.length > 0) {
      const batch = transactions.reduce((l, r) =>
        Hex(Hex.removePrefix(l) + Hex.removePrefix(r)),
      )
      await this.client.writeToCTCContract(batch)
    }
  }
}
