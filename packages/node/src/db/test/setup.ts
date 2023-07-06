import { Logger } from '../../tools/Logger'
import { Database } from '../Database'

export function setupDatabaseTestSuite(): Database {
  const connection =
    process.env.TEST_DB_URL ??
    'postgresql://postgres:password@localhost:5432/byor_test'
  const db = new Database(connection, 'drizzle', Logger.SILENT)
  return db
}
