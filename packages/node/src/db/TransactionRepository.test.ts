import { EthereumAddress, Unsigned64 } from '@byor/shared'
import { expect } from 'earl'

import { TransactionRecord, TransactionRepository } from './TransactionRepository'
import { setupDatabaseTestSuite } from './test/setup'

describe(TransactionRepository.name, () => {
  const database = setupDatabaseTestSuite()
  const repository = new TransactionRepository(database)

  beforeEach(async () => {
    repository.deleteAll()
  })

  describe(TransactionRepository.prototype.addMany.name, () => {
    it('adds many accounts', async () => {
      repository.addMany(modelAccounts1)

      expect(repository.getAll()).toEqual(modelAccounts2)
    })
  })
})