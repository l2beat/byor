import { InferModel } from 'drizzle-orm'

import { BaseRepository } from './BaseRepository'
import { accountsSchema } from './schema'

export type AccountRecord = InferModel<typeof accountsSchema>
export type AccountInsertRecord = InferModel<typeof accountsSchema, 'insert'>

export class AccountRepository extends BaseRepository {
  addOrUpdateMany(accounts: AccountInsertRecord[]): void {
    const drizzle = this.drizzle()

    drizzle.transaction((tx) => {
      accounts.forEach((account) => {
        tx.insert(accountsSchema)
          .values(account)
          .onConflictDoUpdate({
            target: accountsSchema.address,
            set: { nonce: account.nonce, balance: account.balance },
          })
          .run()
      })
    })
  }

  getAll(): AccountRecord[] {
    const drizzle = this.drizzle()
    return drizzle.select().from(accountsSchema).all()
  }

  deleteAll(): void {
    const drizzle = this.drizzle()
    drizzle.delete(accountsSchema).run()
  }
}
