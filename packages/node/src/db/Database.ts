import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import { Logger } from '../tools/Logger'

export class Database {
  private readonly client: postgres.Sql
  private readonly drizzle: PostgresJsDatabase

  constructor(
    private readonly connectionString: string,
    private readonly migrationsPath: string,
    private readonly isProduction: boolean,
    protected readonly logger: Logger,
  ) {
    this.client = postgres(this.connectionString, {
      max: 1,
      onnotice: () => {},
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    })
    this.drizzle = drizzle(this.client)
    this.logger = logger.for(this)
  }

  async migrate(): Promise<void> {
    await migrate(this.drizzle, { migrationsFolder: this.migrationsPath })
    this.logger.info('Migrations completed')
  }

  async close(): Promise<void> {
    await this.client.end()
  }

  getDrizzle(): PostgresJsDatabase {
    return this.drizzle
  }

  getLogger(): Logger {
    return this.logger
  }
}
