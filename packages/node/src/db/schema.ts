import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const transactionsSchema = pgTable(
  'transactions',
  {
    id: integer('id'),
    from: text('from').notNull(),
    to: text('to').notNull(),
    value: integer('value').notNull(),
    nonce: integer('nonce').notNull(),
    fee: integer('fee').notNull(),
    feeReceipent: text('feeReceipent').notNull(),
    l1SubmittedDate: timestamp('l1SubmittedDate').notNull(),
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

export const accountsSchema = pgTable('accounts', {
  address: text('address').primaryKey(),
  balance: integer('balance').default(0).notNull(),
  nonce: integer('nonce').default(0).notNull(),
})

export const fetcherSchema = pgTable('fetcherStates', {
  chainId: integer('chainId').primaryKey(),
  lastFetchedBlock: integer('lastFetchedBlock').default(0).notNull(),
})
