import { Hex, Logger } from '@byor/shared'
import { Mempool } from './peripherals/mempool/Mempool'
import { abi } from './config/abi'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'

export class L1StateSubmitter {
  constructor(
    private readonly flushPeriodSec: number,
    private readonly client: EthereumPrivateClient,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
    setInterval(async () => {
      await this.mempoolSubmit()
    }, this.flushPeriodSec * 1000)
  }

  private async mempoolSubmit(): Promise<void> {
    this.logger.info('Submitting mempool state to L1')
    const transactions = this.mempool.getTransactionsInPool()
    const batch = transactions.reduce((l, r) =>
      Hex(Hex.removePrefix(l) + Hex.removePrefix(r)),
    )
    await this.client.writeToCTCContract(batch)
  }
}
