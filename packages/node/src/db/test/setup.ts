import { Logger } from '../../tools/Logger'
import { Database } from '../Database'

export function setupDatabaseTestSuite(): Database {
  const db = new Database('drizzle', Logger.SILENT)
  return db
}
