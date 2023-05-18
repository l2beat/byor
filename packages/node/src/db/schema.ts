import { InferModel } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const transactions = sqliteTable(
  'transactions',
  {
    id: integer('id').notNull(),
    from: text('from').notNull(),
    to: text('to').notNull(),
    value: integer('value').notNull(),
    nonce: integer('nonce').notNull(),
    fee: integer('fee').notNull(),
    feeReceipent: text('feeReceipent').notNull(),
  },
  (transactions) => ({
    // NOTE(radomski): The best thing to have would be a "UNIQUE" constraint
    // but drizzle-orm does not support that as seen by this issue:
    // https://github.com/drizzle-team/drizzle-orm/issues/229. Because of
    // this we have to choose the next best thing which is to make the
    // unique columns to be a primary key - it also enforces uniqueness.
    compositePk: primaryKey(transactions.from, transactions.nonce),
  }),
)
export const accounts = sqliteTable('accounts', {
  address: text('address').primaryKey(),
  balance: integer('balance').default(0),
  nonce: integer('nonce').default(0),
})

export type Transaction = InferModel<typeof transactions>
export type InsertTransaction = InferModel<typeof transactions, 'insert'>

export type Account = InferModel<typeof accounts>
export type InsertAccount = InferModel<typeof accounts, 'insert'>
