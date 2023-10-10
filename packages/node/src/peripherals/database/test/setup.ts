import { Logger } from '@l2beat/backend-tools'

import { Database } from '../shared/Database'

export function setupDatabaseTestSuite(): Database {
  const connection =
    process.env.TEST_DB_URL ??
    'postgresql://postgres:password@localhost:5432/byor_test'
  const db = new Database(connection, 'drizzle', false, Logger.SILENT)
  return db
}
