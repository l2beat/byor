import {
  assert,
  EthereumAddress,
  hashTransaction,
  Hex,
  Transaction,
  Unsigned64,
} from '@byor/shared'
import { desc, eq, gte, InferModel, sql } from 'drizzle-orm'

import { BaseRepository } from './shared/BaseRepository'
import { transactionsSchema } from './shared/schema'

type InternalTransactionRecord = InferModel<typeof transactionsSchema>
export interface TransactionRecord extends Transaction {
  feeReceipent: EthereumAddress
  l1SubmittedDate: Date
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/* eslint-disable @typescript-eslint/require-await */
export class TransactionRepository extends BaseRepository {
  async getAll(): Promise<TransactionRecord[]> {
    const drizzle = this.drizzle()
    const values = await drizzle.select().from(transactionsSchema)
    return values.map(fromInternalTransaction)
  }

  async getRange(start: number, end: number): Promise<TransactionRecord[]> {
    if (end - start === 0 || end < start) {
      return []
    }

    const drizzle = this.drizzle()
    const values = await drizzle
      .select()
      .from(transactionsSchema)
      .orderBy(desc(transactionsSchema.l1SubmittedDate))
      .limit(end - start)
      .offset(start)

    return values.map(fromInternalTransaction)
  }

  async addMany(txs: TransactionRecord[]): Promise<void> {
    txs.forEach((tx) => {
      if (!tx.hash) {
        tx.hash = hashTransaction(tx)
      }
    })

    const drizzle = this.drizzle()
    await drizzle
      .insert(transactionsSchema)
      .values(txs.map(toInternalTransaction))
  }

  async getCount(): Promise<number> {
    const drizzle = this.drizzle()
    const result = await drizzle
      .select({ count: sql<string>`count(*)` })
      .from(transactionsSchema)
    return parseInt(result[0]?.count ?? '0')
  }

  async getCountSinceLast24h(): Promise<number> {
    const drizzle = this.drizzle()
    const result = await drizzle
      .select({ count: sql<string>`count(*)` })
      .from(transactionsSchema)
      .where(
        gte(
          transactionsSchema.l1SubmittedDate,
          new Date(new Date().getTime() - ONE_DAY_MS),
        ),
      )
    return parseInt(result[0]?.count ?? '0')
  }

  async deleteAll(): Promise<void> {
    const drizzle = this.drizzle()
    await drizzle.delete(transactionsSchema)
  }

  async getDailyTokenVolume(): Promise<number> {
    const drizzle = this.drizzle()
    const result = await drizzle
      .select({
        volume: sql<string>`sum(${transactionsSchema.fee}) + sum(${transactionsSchema.value})`,
      })
      .from(transactionsSchema)
      .where(
        gte(
          transactionsSchema.l1SubmittedDate,
          new Date(new Date().getTime() - ONE_DAY_MS),
        ),
      )

    return parseInt(result[0]?.volume ?? '0')
  }

  async getYoungestTransactionDate(): Promise<Date | null> {
    const drizzle = this.drizzle()
    const [tx] = await drizzle
      .select()
      .from(transactionsSchema)
      .orderBy(desc(transactionsSchema.l1SubmittedDate))
      .limit(1)

    if (tx) {
      return tx.l1SubmittedDate
    }

    return null
  }

  async getByHash(hash: Hex): Promise<TransactionRecord | undefined> {
    const drizzle = this.drizzle()
    const [tx] = await drizzle
      .select()
      .from(transactionsSchema)
      .where(eq(transactionsSchema.hash, hash.toString()))
      .limit(1)

    return tx ? fromInternalTransaction(tx) : undefined
  }
}

function toInternalTransaction(
  tx: TransactionRecord,
): InternalTransactionRecord {
  // WARNING(radomski): This can fail very badly if the value represented
  // by 'BigInt' is so big that the floating point nature of 'number'
  // causes it to lose precision. This can happen when the value is
  // bigger then Number.MAX_SAFE_INTEGER. drizzle-orm should support
  // passing values as bigints into the query but it currently does
  // not (see https://github.com/drizzle-team/drizzle-orm/issues/611).
  // For real applications where the upper parts of the 64bit values
  // are needed please consider removing drizzle-orm!

  assert(
    tx.value.valueOf() <= BigInt(Number.MAX_SAFE_INTEGER),
    'The Unsigned64 value is bigger than the biggest safely representable value',
  )
  assert(
    tx.nonce.valueOf() <= BigInt(Number.MAX_SAFE_INTEGER),
    'The Unsigned64 value is bigger than the biggest safely representable value',
  )
  assert(
    tx.fee.valueOf() <= BigInt(Number.MAX_SAFE_INTEGER),
    'The Unsigned64 value is bigger than the biggest safely representable value',
  )
  assert(tx.hash, "expected the transaction to have it's hash calculated")

  return {
    id: null,
    from: tx.from.toString(),
    to: tx.to.toString(),
    value: parseInt(tx.value.toString(), 10),
    nonce: parseInt(tx.nonce.toString(), 10),
    fee: parseInt(tx.fee.toString(), 10),
    feeReceipent: tx.feeReceipent.toString(),
    l1SubmittedDate: tx.l1SubmittedDate,
    hash: tx.hash.toString(),
  }
}

function fromInternalTransaction(
  tx: InternalTransactionRecord,
): TransactionRecord {
  return {
    from: EthereumAddress(tx.from),
    to: EthereumAddress(tx.to),
    value: Unsigned64(tx.value),
    nonce: Unsigned64(tx.nonce),
    fee: Unsigned64(tx.fee),
    feeReceipent: EthereumAddress(tx.feeReceipent),
    l1SubmittedDate: tx.l1SubmittedDate,
    hash: Hex(tx.hash),
  }
}
