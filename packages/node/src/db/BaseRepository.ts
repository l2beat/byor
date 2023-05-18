import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { Database } from './Database'

export abstract class BaseRepository {
  constructor(protected readonly database: Database) {}

  protected drizzle(): BetterSQLite3Database {
    return this.database.getDrizzle()
  }
}
