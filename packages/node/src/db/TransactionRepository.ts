import { EthereumAddress, Transaction, Unsigned64, assert } from '@byor/shared'
import { InferModel, sql, gte } from 'drizzle-orm'

import { BaseRepository } from './BaseRepository'
import { transactionsSchema } from './schema'

type InternalTransactionRecord = InferModel<typeof transactionsSchema>
export interface TransactionRecord extends Transaction {
    feeReceipent: EthereumAddress
    l1SubmittedDate: Date,
}

export class TransactionRepository extends BaseRepository {

    getAll(): TransactionRecord[] {
        const drizzle = this.drizzle()
        return drizzle
            .select()
            .from(transactionsSchema)
            .all()
            .map((tx) => fromInternalTransaction(tx))
    }

    addMany(txs: TransactionRecord[]) {
        const drizzle = this.drizzle()
        drizzle.insert(transactionsSchema).values(txs.map(toInternalTransaction)).run()
    }

    getCount(): number {
        const drizzle = this.drizzle()
        return drizzle
            .select({ count: sql<number>`count(*)` })
            .from(transactionsSchema)
            .get().count
    }

    getCountSinceLast24h(): number {
        const drizzle = this.drizzle()
        return drizzle
            .select({ count: sql<number>`count(*)` })
            .from(transactionsSchema)
            .where(gte(transactionsSchema.l1SubmittedDate, new Date(new Date().getTime() - (24 * 60 * 60 * 1000))))
            .get().count
    }

    deleteAll(): void {
        const drizzle = this.drizzle()
        drizzle.delete(transactionsSchema).run()
    }
}

function toInternalTransaction(tx: TransactionRecord): InternalTransactionRecord {
    // WARNING(radomski): This can fail very badly if the value represented
    // by 'BigInt' is so big that the floating point nature of 'number'
    // causes it to lose precision. This can happen when the value is
    // bigger then Number.MAX_SAFE_INTEGER. drizzle-orm should support
    // passing values as bigints into the query but it currently does
    // not (see https://github.com/drizzle-team/drizzle-orm/issues/611).
    // For real applications where the upper parts of the 64bit values
    // are needed please consider removing drizzle-orm!

    assert(
        Unsigned64.toBigInt(tx.value) <= BigInt(Number.MAX_SAFE_INTEGER),
        'The Unsigned64 value is bigger than the biggest safely representable value',
    )
    assert(
        Unsigned64.toBigInt(tx.nonce) <= BigInt(Number.MAX_SAFE_INTEGER),
        'The Unsigned64 value is bigger than the biggest safely representable value',
    )
    assert(
        Unsigned64.toBigInt(tx.fee) <= BigInt(Number.MAX_SAFE_INTEGER),
        'The Unsigned64 value is bigger than the biggest safely representable value',
    )

    return {
        id: null,
        from: tx.from.toString(),
        to: tx.to.toString(),
        value: parseInt(tx.value.toString(), 10),
        nonce: parseInt(tx.nonce.toString(), 10),
        fee: parseInt(tx.fee.toString(), 10),
        feeReceipent: tx.feeReceipent.toString(),
        l1SubmittedDate: tx.l1SubmittedDate,
    }
}

function fromInternalTransaction(tx: InternalTransactionRecord): TransactionRecord {
    return {
        from: EthereumAddress(tx.from),
        to: EthereumAddress(tx.to),
        value: Unsigned64(tx.value),
        nonce: Unsigned64(tx.nonce),
        fee: Unsigned64(tx.fee),
        feeReceipent: EthereumAddress(tx.feeReceipent),
        l1SubmittedDate: tx.l1SubmittedDate,
    }
}
