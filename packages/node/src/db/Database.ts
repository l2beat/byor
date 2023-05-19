import DatabaseDriver from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

export class Database {
  private readonly drizzle: BetterSQLite3Database

  constructor(path: string) {
    const sqlite = new DatabaseDriver(path)
    this.drizzle = drizzle(sqlite)
  }

  createTables(path: string): void {
    migrate(this.drizzle, { migrationsFolder: path })
  }

  getDrizzle(): BetterSQLite3Database {
    return this.drizzle
  }
}
