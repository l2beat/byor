import { Logger } from '@byor/shared'
import DatabaseDriver from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

export class Database {
  private readonly drizzle: BetterSQLite3Database
  protected readonly logger: Logger

  constructor(path: string, logger: Logger) {
    const sqlite = new DatabaseDriver(path)
    this.drizzle = drizzle(sqlite)
    this.logger = logger.for(this)
  }

  createTables(path: string): void {
    migrate(this.drizzle, { migrationsFolder: path })
  }

  getDrizzle(): BetterSQLite3Database {
    return this.drizzle
  }

  getLogger(): Logger {
    return this.logger
  }
}
