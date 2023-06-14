import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const transactionsSchema = sqliteTable(
  'transactions',
  {
    id: integer('id'),
    from: text('from').notNull(),
    to: text('to').notNull(),
    value: integer('value').notNull(),
    nonce: integer('nonce').notNull(),
    fee: integer('fee').notNull(),
    feeReceipent: text('feeReceipent').notNull(),
    l1SubmittedDate: integer('l1SubmittedDate', {
      mode: 'timestamp',
    }).notNull(),
    hash: text('hash').notNull(),
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

export const accountsSchema = sqliteTable('accounts', {
  address: text('address').primaryKey(),
  balance: integer('balance').default(0).notNull(),
  nonce: integer('nonce').default(0).notNull(),
})

export const fetcherSchema = sqliteTable('fetcherStates', {
  chainId: integer('chainId').primaryKey(),
  lastFetchedBlock: integer('lastFetchedBlock').default(0).notNull(),
})
