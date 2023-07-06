import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { Database } from './Database'

export abstract class BaseRepository {
  constructor(protected readonly database: Database) {}

  protected drizzle(): PostgresJsDatabase {
    return this.database.getDrizzle()
  }
}
