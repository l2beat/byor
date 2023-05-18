import DatabaseDriver from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'

export class Database {
  private readonly drizzle: BetterSQLite3Database

  constructor(path: string) {
    const sqlite = new DatabaseDriver(path)
    this.drizzle = drizzle(sqlite)
  }

  getDrizzle(): BetterSQLite3Database {
    return this.drizzle
  }
}
