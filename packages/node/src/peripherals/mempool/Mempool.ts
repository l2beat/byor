import {
  assert,
  hashTransaction,
  Hex,
  Logger,
  SignedTransaction,
} from '@byor/shared'

export class Mempool {
  private pool: SignedTransaction[]

  constructor(private readonly logger: Logger) {
    this.logger = logger.for(this)
    this.pool = []
  }

  add(transactions: SignedTransaction[]): void {
    this.logger.info('Adding', { transactionCount: transactions.length })
    transactions.forEach((tx) => {
      tx.hash = hashTransaction(tx)
    })

    this.pool.push(...transactions)
  }

  popNHighestFee(n: number): SignedTransaction[] {
    const sorted = this.pool.sort((a, b) => {
      if (a.fee < b.fee) {
        return 1
      }
      if (a.fee > b.fee) {
        return -1
      }
      return 0
    })

    this.pool = sorted.slice(n)
    return sorted.slice(0, n)
  }

  getTransactionsInPool(): SignedTransaction[] {
    return this.pool
  }

  contains(hash: Hex): boolean {
    return this.pool.some((tx) => {
      assert(tx.hash)
      return tx.hash === hash
    })
  }

  empty(): void {
    this.pool = []
  }
}
