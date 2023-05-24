import { Logger, Transaction } from '@byor/shared'

export class Mempool {
  private pool: Transaction[]

  constructor(private readonly logger: Logger) {
    this.logger = logger.for(this)
    this.pool = []
  }

  add(transactions: Transaction[]): void {
    this.logger.info('Adding transactions to the mempool', {
      transactionCount: transactions.length,
    })
    this.pool.concat(transactions)
  }

  empty(): void {
    this.pool = []
  }
}
