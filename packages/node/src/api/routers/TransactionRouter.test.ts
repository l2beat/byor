import { expect, mockFn, mockObject } from 'earl'

import { MempoolController } from '../../peripherals/mempool/MempoolController'
import { createTestApiServer } from './test/createTestApiServer'
import { createTransactionRouter } from './TransactionRouter'

describe(createTransactionRouter.name, () => {
  it('if data is accepted returns success', async () => {
    const mempoolController = mockObject<MempoolController>({
      tryToAdd: mockFn().returnsOnce(Promise.resolve()),
    })
    const router = createTransactionRouter(mempoolController)
    const server = createTestApiServer({ router })

    await server
      .post('/router.submit')
      .send('"0x1234"')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect('Content-Type', /json/)
      .expect(200, '{"result":{}}')

    expect(mempoolController.tryToAdd).toHaveBeenCalledTimes(1)
  })

  it('if tryToAdd throws returns BAD_ACCESS', async () => {
    const mempoolController = mockObject<MempoolController>({
      tryToAdd: mockFn().throwsOnce(new Error('...')),
    })
    const router = createTransactionRouter(mempoolController)
    const server = createTestApiServer({ router })

    await server
      .post('/router.submit')
      .send('"0x1234"')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect('Content-Type', /json/)
      .expect(400)

    expect(mempoolController.tryToAdd).toHaveBeenCalledTimes(1)
  })

  for (const data of [
    1234,
    "'0x1234'",
    '"0xabcdefghijk"',
    '{"0x1234"}',
    '["0x1234"]',
  ]) {
    it(`returns BAD_ACCESS on invalid JSON [${data}]`, async () => {
      const mempoolController = mockObject<MempoolController>({
        tryToAdd: mockFn().returnsOnce(Promise.resolve()),
      })
      const router = createTransactionRouter(mempoolController)
      const server = createTestApiServer({ router })

      await server
        .post('/router.submit')
        .send(`${data}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(mempoolController.tryToAdd).toHaveBeenCalledTimes(0)
    })
  }
})
