import { assert, hashTransaction, Hex, SignedTransaction } from '@byor/shared'
import { zip } from 'lodash'

import { Logger } from '../../tools/Logger'

export class Mempool {
  private pool: SignedTransaction[]
  private poolTimestamps: number[]

  constructor(private readonly logger: Logger) {
    this.logger = logger.for(this)
    this.pool = []
    this.poolTimestamps = []
  }

  size(): number {
    return this.pool.length
  }

  add(transactions: SignedTransaction[]): void {
    this.logger.info('Adding', { transactionCount: transactions.length })
    transactions.forEach((tx) => {
      tx.hash = hashTransaction(tx)
    })

    this.pool.push(...transactions)
    this.poolTimestamps.push(
      ...new Array<number>(transactions.length).fill(Date.now()),
    )
  }

  popNHighestFee(n: number): SignedTransaction[] {
    assert(
      this.pool.length === this.poolTimestamps.length,
      'Invalid mempool state, dropping everything',
    )

    // NOTE(radomski): We know that it won't be undefined
    // because of the assert at the beginning of this function
    /* eslint-disable */
    const sorted = zip(this.pool, this.poolTimestamps).sort(
      ([a, _], [b, __]) => {
        if (a!.fee < b!.fee) {
          return 1
        }
        if (a!.fee > b!.fee) {
          return -1
        }
        return 0
      },
    )

    this.pool = sorted.slice(n).map(([a, _]) => a!)
    this.poolTimestamps = sorted.slice(n).map(([_, a]) => a!)

    return sorted.slice(0, n).map(([a, _]) => a!)
    /* eslint-enable */
  }

  getTransactionsInPool(): SignedTransaction[] {
    return this.pool
  }

  getTransactionsTimestamps(): number[] {
    return this.poolTimestamps
  }

  getByHash(hash: Hex): SignedTransaction | undefined {
    return this.pool.filter((tx) => {
      assert(tx.hash)
      return tx.hash === hash
    })[0]
  }

  empty(): void {
    this.pool = []
  }
}
