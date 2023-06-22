import { Logger } from '@byor/shared'

import { Database } from '../Database'

export function setupDatabaseTestSuite(): Database {
  const db = new Database(':memory:', 'db/migrations', Logger.SILENT)
  return db
}
