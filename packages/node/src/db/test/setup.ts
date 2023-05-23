import { Database } from '../Database'

export function setupDatabaseTestSuite(): Database {
  const db = new Database(':memory:')
  db.createTables('db/migrations')
  return db
}
