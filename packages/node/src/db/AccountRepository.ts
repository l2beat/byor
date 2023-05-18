import { InferModel } from 'drizzle-orm'

import { BaseRepository } from './BaseRepository'
import { accountsSchema } from './schema'

export type AccountRecord = InferModel<typeof accountsSchema>
export type AccountInsertRecord = InferModel<typeof accountsSchema, 'insert'>

export class AccountRepository extends BaseRepository {
  addOrUpdateMany(accounts: AccountInsertRecord[]): void {
    const drizzle = this.drizzle()
    drizzle.insert(accountsSchema).values(accounts)
  }
}
