import { expect } from 'earl'

import {
  AccountInsertRecord,
  AccountRecord,
  AccountRepository,
} from './AccountRepository'
import { setupDatabaseTestSuite } from './test/setup'

describe(AccountRepository.name, () => {
  const database = setupDatabaseTestSuite()
  const repository = new AccountRepository(database)

  beforeEach(async () => {
    repository.deleteAll()
  })

  describe(AccountRepository.prototype.addOrUpdateMany.name, () => {
    it('updates many account', async () => {
      const accounts1: AccountInsertRecord[] = [
        { address: '0xdeadbeef', balance: 0, nonce: 0 },
        { address: '0xcafebabe', balance: 59, nonce: 777 },
      ]
      repository.addOrUpdateMany(accounts1)
      const accounts2: AccountInsertRecord[] = [
        { address: '0xdeadbeef', balance: 0, nonce: 1 },
        { address: '0xcafebabe', balance: 800, nonce: 777 },
      ]
      repository.addOrUpdateMany(accounts2)
      expect(repository.getAll()).toEqual(accounts2 as AccountRecord[])
    })
  })

  describe(AccountRepository.prototype.getAll.name, () => {
    it('gets all', async () => {
      const accounts: AccountInsertRecord[] = [
        { address: '0xdeadbeef', balance: 0, nonce: 0 },
        { address: '0xcafebabe', balance: 59, nonce: 777 },
      ]
      repository.addOrUpdateMany(accounts)
      expect(repository.getAll()).toEqual(accounts as AccountRecord[])
    })
  })

  describe(AccountRepository.prototype.deleteAll.name, () => {
    it('deletes all', async () => {
      const accounts: AccountInsertRecord[] = [
        { address: '0xdeadbeef', balance: 0, nonce: 0 },
        { address: '0xcafebabe', balance: 59, nonce: 777 },
      ]
      repository.addOrUpdateMany(accounts)
      repository.deleteAll()
      expect(repository.getAll()).toEqual([])
    })
  })
})
