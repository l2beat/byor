import { Hex } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'

import { TransactionRepository } from '../../db/TransactionRepository'
import { Mempool } from '../../peripherals/mempool/Mempool'
import { createTestApiServer } from './test/createTestApiServer'
import { createTransactionRouter } from './TransactionRouter'

describe(createTransactionRouter.name, () => {
  describe('submit', () => {
    it('if data is accepted returns success', async () => {
      const modelTxSerializedHex = Hex(
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b',
      )
      const mempool = mockObject<Mempool>({
        add: mockFn().returnsOnce(null),
      })
      const transactionRepository = mockObject<TransactionRepository>({})
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .post('/router.submit')
        .send(`"${modelTxSerializedHex.toString()}"`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(200, '{"result":{}}')

      expect(mempool.add).toHaveBeenCalledTimes(1)
    })

    for (const data of [
      1234,
      "'0x1234'",
      '"0xabcdefghijk"',
      '{"0x1234"}',
      '["0x1234"]',
    ]) {
      it(`returns BAD_ACCESS on invalid JSON [${data}]`, async () => {
        const mempool = mockObject<Mempool>({
          add: mockFn().returnsOnce(null),
        })
        const transactionRepository = mockObject<TransactionRepository>({})
        const router = createTransactionRouter(mempool, transactionRepository)
        const server = createTestApiServer({ router })

        await server
          .post('/router.submit')
          .send(`${data}`)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .expect('Content-Type', /json/)
          .expect(400)

        expect(mempool.add).toHaveBeenCalledTimes(0)
      })
    }
  })

  describe('getRange', () => {
    it('can return data', async () => {
      const mempool = mockObject<Mempool>({})
      const transactionRepository = mockObject<TransactionRepository>({
        getRange: mockFn().returnsOnce([
          {
            hash: '0x1234',
            from: '0xabcd',
            to: '0xef98',
            value: '1234',
            l1SubmittedDate: new Date(314159),
          },
        ]),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getRange?input={ "start": 0, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(
          200,
          '{"result":{"data":[{"hash":"0x1234","from":"0xabcd","to":"0xef98","value":"1234","date":314159}]}}',
        )
    })

    it('can return empty array', async () => {
      const mempool = mockObject<Mempool>({})
      const transactionRepository = mockObject<TransactionRepository>({
        getRange: mockFn().returnsOnce([]),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getRange?input={ "start": 0, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(200, '{"result":{"data":[]}}')
    })

    it('range has to be positive', async () => {
      const mempool = mockObject<Mempool>({})
      const transactionRepository = mockObject<TransactionRepository>({
        getRange: mockFn().returnsOnce([]),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getRange?input={ "start": -2, "end": -4}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('start has to be smaller than end', async () => {
      const mempool = mockObject<Mempool>({})
      const transactionRepository = mockObject<TransactionRepository>({
        getRange: mockFn().returnsOnce([]),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getRange?input={ "start": 4, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(400)
    })
  })

  describe('getMempoolRange', () => {
    it('can return data', async () => {
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([
          {
            hash: '0x1234',
            from: '0xabcd',
            to: '0xef98',
            value: 1234,
          },
        ]),
        getTransactionsTimestamps: mockFn().returnsOnce([314159]),
      })
      const transactionRepository = mockObject<TransactionRepository>({})
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getMempoolRange?input={ "start": 0, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(
          200,
          '{"result":{"data":[{"hash":"0x1234","from":"0xabcd","to":"0xef98","value":"1234","date":314159}]}}',
        )
    })

    it('can return empty array', async () => {
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        getTransactionsTimestamps: mockFn().returnsOnce([]),
      })
      const transactionRepository = mockObject<TransactionRepository>({})
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getMempoolRange?input={ "start": 0, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(200, '{"result":{"data":[]}}')
    })

    it('returns internal error on invalid mempool state', async () => {
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        getTransactionsTimestamps: mockFn().returnsOnce([314159]),
      })
      const transactionRepository = mockObject<TransactionRepository>({})
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getMempoolRange?input={ "start": 0, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(500)
    })

    it('range has to be positive', async () => {
      const mempool = mockObject<Mempool>({})
      const transactionRepository = mockObject<TransactionRepository>({
        getRange: mockFn().returnsOnce([]),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getMempoolRange?input={ "start": -2, "end": -4}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(400)
    })

    it('start has to be smaller than end', async () => {
      const mempool = mockObject<Mempool>({})
      const transactionRepository = mockObject<TransactionRepository>({
        getRange: mockFn().returnsOnce([]),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getMempoolRange?input={ "start": 4, "end": 2}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(400)
    })
  })

  describe('getStatus', () => {
    it('accepts a valid hash for non existent transaction', async () => {
      const hash = Hex(
        '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
      )
      const mempool = mockObject<Mempool>({
        getByHash: mockFn().returnsOnce(undefined),
      })
      const transactionRepository = mockObject<TransactionRepository>({
        getByHash: mockFn().returnsOnce(undefined),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getStatus?input="${hash.toString()}"`)
        .send(``)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(
          200,
          '{"result":{"data":{"transaction":null,"status":"Not found"}}}',
        )

      expect(mempool.getByHash).toHaveBeenCalledTimes(1)
      expect(transactionRepository.getByHash).toHaveBeenCalledTimes(1)
    })

    it('accepts a valid hash for soft-commited transaction', async () => {
      const hash = Hex(
        '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
      )
      const mempool = mockObject<Mempool>({
        getByHash: mockFn().returnsOnce({
          from: '0x5678',
          to: '0x9abc',
          value: 12,
          nonce: 34,
        }),
      })
      const transactionRepository = mockObject<TransactionRepository>({
        getByHash: mockFn().returnsOnce(undefined),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getStatus?input="${hash.toString()}"`)
        .send(``)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(
          200,
          '{"result":{"data":{"transaction":{"from":"0x5678","to":"0x9abc","value":"12","nonce":"34"},"status":"Soft committed"}}}',
        )

      expect(mempool.getByHash).toHaveBeenCalledTimes(1)
      expect(transactionRepository.getByHash).toHaveBeenCalledTimes(0)
    })

    it('accepts a valid hash for commited transaction', async () => {
      const hash = Hex(
        '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
      )
      const mempool = mockObject<Mempool>({
        getByHash: mockFn().returnsOnce(undefined),
      })
      const transactionRepository = mockObject<TransactionRepository>({
        getByHash: mockFn().returnsOnce({
          from: '0x5678',
          to: '0x9abc',
          value: 12,
          nonce: 34,
        }),
      })
      const router = createTransactionRouter(mempool, transactionRepository)
      const server = createTestApiServer({ router })

      await server
        .get(`/router.getStatus?input="${hash.toString()}"`)
        .send(``)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(
          200,
          '{"result":{"data":{"transaction":{"from":"0x5678","to":"0x9abc","value":"12","nonce":"34"},"status":"Committed"}}}',
        )

      expect(mempool.getByHash).toHaveBeenCalledTimes(1)
      expect(transactionRepository.getByHash).toHaveBeenCalledTimes(1)
    })

    for (const data of [
      '0x1234',
      '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe170',
    ]) {
      it(`discards invalid data [${data}]`, async () => {
        const hash = Hex(data)
        const mempool = mockObject<Mempool>({
          getByHash: mockFn().returnsOnce(undefined),
        })
        const transactionRepository = mockObject<TransactionRepository>({
          getByHash: mockFn().returnsOnce(undefined),
        })
        const router = createTransactionRouter(mempool, transactionRepository)
        const server = createTestApiServer({ router })

        await server
          .get(`/router.getStatus?input="${hash.toString()}"`)
          .send(``)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .expect('Content-Type', /json/)
          .expect(400)

        expect(mempool.getByHash).toHaveBeenCalledTimes(0)
        expect(transactionRepository.getByHash).toHaveBeenCalledTimes(0)
      })
    }
  })
})
