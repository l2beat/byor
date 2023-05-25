import { Hex, Logger, Transaction } from '@byor/shared'

export class Mempool {
  private pool: Hex[]

  constructor(private readonly logger: Logger) {
    this.logger = logger.for(this)
    this.pool = []
  }

  add(transactionsBytes: Hex): void {
    this.logger.info('Adding transactions to the mempool')
    this.pool.push(transactionsBytes)
  }

  getTransactionsInPool(): Hex[] {
    return this.pool
  }

  empty(): void {
    this.pool = []
  }
}
