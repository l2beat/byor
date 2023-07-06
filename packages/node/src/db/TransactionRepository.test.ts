import { EthereumAddress, Hex, Unsigned64 } from '@byor/shared'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from './test/setup'
import { TransactionRepository } from './TransactionRepository'

describe(TransactionRepository.name, () => {
  const database = setupDatabaseTestSuite()
  const repository = new TransactionRepository(database)
  const dateMinus12h = new Date(new Date().getTime() - 12 * 60 * 60 * 1000)
  const modelTransactions = [
    {
      from: EthereumAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
      to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
      value: Unsigned64(10),
      nonce: Unsigned64(4),
      fee: Unsigned64(2),
      feeReceipent: EthereumAddress(
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      ),
      l1SubmittedDate: new Date('2000-01-01'),
    },
    {
      from: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
      to: EthereumAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
      value: Unsigned64(20),
      nonce: Unsigned64(7),
      fee: Unsigned64(999),
      feeReceipent: EthereumAddress(
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      ),
      l1SubmittedDate: dateMinus12h,
    },
  ]

  before(() => {
    modelTransactions[1]?.l1SubmittedDate.setMinutes(0)
    modelTransactions[1]?.l1SubmittedDate.setSeconds(0)
    modelTransactions[1]?.l1SubmittedDate.setMilliseconds(0)
  })

  beforeEach(async () => {
    await repository.deleteAll()
  })

  describe(TransactionRepository.prototype.addMany.name, () => {
    it('adds single transaction', async () => {
      await repository.addMany(modelTransactions.slice(0, 1))

      expect(await repository.getAll()).toEqual(modelTransactions.slice(0, 1))
    })

    it('adds many transactions', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getAll()).toEqual(modelTransactions)
    })
  })

  describe(TransactionRepository.prototype.getRange.name, () => {
    it('sorts by time and returns a valid range when given too big one', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getRange(1, 3)).toEqual(
        modelTransactions.slice(0, 1),
      )
    })

    it('sorts by time and returns the whole range', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getRange(0, 2)).toEqual([
        modelTransactions[1]!,
        modelTransactions[0]!,
      ])
    })

    it('returns nothing if range is of zero length even if database contains rows', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getRange(0, 0)).toEqual([])
    })

    it('returns nothing if end is smaller than start', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getRange(2, 0)).toEqual([])
    })

    it('returns nothing on empty even if range is of non-zero length', async () => {
      expect(await repository.getRange(0, 10)).toEqual([])
    })
  })

  describe(TransactionRepository.prototype.getCount.name, () => {
    it('gets count of no transactions', async () => {
      expect(await repository.getCount()).toEqual(0)
    })

    it('gets count of single account', async () => {
      await repository.addMany(modelTransactions.slice(0, 1))

      expect(await repository.getCount()).toEqual(1)
    })

    it('gets count of many transactions', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getCount()).toEqual(modelTransactions.length)
    })
  })

  describe(TransactionRepository.prototype.getCountSinceLast24h.name, () => {
    it('gets count of no transactions', async () => {
      expect(await repository.getCountSinceLast24h()).toEqual(0)
    })

    it('gets count of single account that is older than 24h', async () => {
      await repository.addMany(modelTransactions.slice(0, 1))

      expect(await repository.getCountSinceLast24h()).toEqual(0)
    })

    it('gets count of many transactions where only one is younger than 24h', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getCountSinceLast24h()).toEqual(1)
    })
  })

  describe(TransactionRepository.prototype.deleteAll.name, () => {
    it('deletes added accounts', async () => {
      await repository.addMany(modelTransactions)
      await repository.deleteAll()

      expect(await repository.getCount()).toEqual(0)
    })

    it('no-op if empty', async () => {
      await repository.deleteAll()

      expect(await repository.getCount()).toEqual(0)
    })
  })

  describe(TransactionRepository.prototype.getDailyTokenVolume.name, () => {
    it('returns token volume for transactions yonger than 24h', async () => {
      await repository.addMany(modelTransactions)

      expect(await repository.getDailyTokenVolume()).toEqual(1019)
    })

    it('returns zero if all transactions are older than 24h', async () => {
      await repository.addMany(modelTransactions.slice(0, 1))

      expect(await repository.getDailyTokenVolume()).toEqual(0)
    })

    it('no-op if empty', async () => {
      expect(await repository.getDailyTokenVolume()).toEqual(0)
    })
  })

  describe(
    TransactionRepository.prototype.getYoungestTransactionDate.name,
    () => {
      it('returns token volume for transactions yonger than 24h', async () => {
        await repository.addMany(modelTransactions)

        expect(await repository.getYoungestTransactionDate()).toEqual(
          dateMinus12h,
        )
      })

      it('returns token volume for transactions yonger than 24h', async () => {
        expect(await repository.getYoungestTransactionDate()).toEqual(null)
      })
    },
  )

  describe(TransactionRepository.prototype.getByHash.name, () => {
    it('returns transaction that is in the database', async () => {
      await repository.addMany(modelTransactions)

      expect(
        await repository.getByHash(
          Hex(
            '0x227d62c499fec877231acd731b3cb3e2556c1c14328b3a9c2d1c347ec58377e6',
          ),
        ),
      ).toEqual(modelTransactions[0])
    })

    it('returns undefined on non-existing with transactions in database', async () => {
      await repository.addMany(modelTransactions)

      expect(
        await repository.getByHash(
          Hex(
            '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
          ),
        ),
      ).toEqual(undefined)
    })

    it('returns undefined on empty', async () => {
      expect(
        await repository.getByHash(
          Hex(
            '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
          ),
        ),
      ).toEqual(undefined)
    })
  })
})
