import { Logger, SignedTransaction } from '@byor/shared'

export class Mempool {
  private pool: SignedTransaction[]

  constructor(private readonly logger: Logger) {
    this.logger = logger.for(this)
    this.pool = []
  }

  add(transactionsBytes: SignedTransaction[]): void {
    this.logger.info('Adding transactions to the mempool')
    this.pool.push(...transactionsBytes)
  }

  getTransactionsInPool(): SignedTransaction[] {
    return this.pool
  }

  empty(): void {
    this.pool = []
  }
}
