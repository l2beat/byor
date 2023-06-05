import { EthereumAddress, Unsigned64 } from '@byor/shared'
import { expect } from 'earl'

import { TransactionRecord, TransactionRepository } from './TransactionRepository'
import { setupDatabaseTestSuite } from './test/setup'

describe(TransactionRepository.name, () => {
  const database = setupDatabaseTestSuite()
  const repository = new TransactionRepository(database)
  const modelTransactions = [
      {
          from: EthereumAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
          to: EthereumAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
          value: Unsigned64(10),
          nonce: Unsigned64(4),
          fee: Unsigned64(2),
          feeReceipent: EthereumAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"),
          l1SubmittedDate: new Date('2000-01-01'),
      },
      {
          from: EthereumAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
          to: EthereumAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
          value: Unsigned64(20),
          nonce: Unsigned64(7),
          fee: Unsigned64(999),
          feeReceipent: EthereumAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"),
          l1SubmittedDate: new Date(new Date().getTime() - (12 * 60 * 60 * 1000)),
      }
  ]

  before(() => {
      modelTransactions[1]?.l1SubmittedDate.setMinutes(0)
      modelTransactions[1]?.l1SubmittedDate.setSeconds(0)
      modelTransactions[1]?.l1SubmittedDate.setMilliseconds(0)
  })

  beforeEach(async () => {
    repository.deleteAll()
  })

  describe(TransactionRepository.prototype.addMany.name, () => {
    it('adds single transaction', async () => {
      repository.addMany(modelTransactions.slice(0, 1))

      expect(repository.getAll()).toEqual(modelTransactions.slice(0, 1))
    })

    it('adds many transactions', async () => {
      repository.addMany(modelTransactions)

      expect(repository.getAll()).toEqual(modelTransactions)
    })
  })

  describe(TransactionRepository.prototype.getCount.name, () => {
    it('gets count of no transactions', async () => {
      expect(repository.getCount()).toEqual(0)
    })

    it('gets count of single account', async () => {
      repository.addMany(modelTransactions.slice(0, 1))

      expect(repository.getCount()).toEqual(1)
    })

    it('gets count of many transactions', async () => {
      repository.addMany(modelTransactions)

      expect(repository.getCount()).toEqual(modelTransactions.length)
    })
  })

  describe(TransactionRepository.prototype.getCountSinceLast24h.name, () => {
    it('gets count of no transactions', async () => {
      expect(repository.getCountSinceLast24h()).toEqual(0)
    })

    it('gets count of single account that is older than 24h', async () => {
      repository.addMany(modelTransactions.slice(0, 1))

      expect(repository.getCountSinceLast24h()).toEqual(0)
    })

    it('gets count of many transactions where only one is younger than 24h', async () => {
      repository.addMany(modelTransactions)

      expect(repository.getCountSinceLast24h()).toEqual(1)
    })
  })

  describe(TransactionRepository.prototype.deleteAll.name, () => {
    it('deletes added accounts', async () => {
      repository.addMany(modelTransactions)
      repository.deleteAll()

      expect(repository.getCount()).toEqual(0)
    })

    it('no-op if empty', async () => {
        repository.deleteAll()

      expect(repository.getCount()).toEqual(0)
    })
  })
})
