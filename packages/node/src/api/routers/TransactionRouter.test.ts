import { Hex } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'

import { TransactionRepository } from '../../db/TransactionRepository'
import { Mempool } from '../../peripherals/mempool/Mempool'
import { createTestApiServer } from './test/createTestApiServer'
import { createTransactionRouter } from './TransactionRouter'

describe(createTransactionRouter.name, () => {
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
