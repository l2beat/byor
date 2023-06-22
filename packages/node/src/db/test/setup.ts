import { Logger } from '@byor/shared'

import { Database } from '../Database'

export function setupDatabaseTestSuite(): Database {
  const db = new Database(':memory:', Logger.SILENT)
  db.createTables('db/migrations')
  return db
}
