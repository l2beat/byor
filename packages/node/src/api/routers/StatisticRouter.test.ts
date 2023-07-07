import { mockFn, mockObject } from 'earl'

import { TransactionRepository } from '../../peripherals/database/TransactionRepository'
import { createStatisticsRouter } from './StatisticRouter'
import { createTestApiServer } from './test/createTestApiServer'

describe(createStatisticsRouter.name, () => {
  it('if data is accepted returns success', async () => {
    const transactionRepository = mockObject<TransactionRepository>({
      getCount: mockFn().returnsOnce(955),
      getCountSinceLast24h: mockFn().returnsOnce(74),
      getDailyTokenVolume: mockFn().returnsOnce(293585),
      getYoungestTransactionDate: mockFn().returnsOnce(
        new Date(1624792948 * 1000),
      ),
    })
    const router = createStatisticsRouter(transactionRepository)
    const server = createTestApiServer({ router })

    await server
      .get('/router.getOverview')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(
        200,
        '{"result":{"data":{"l2TransactionCount":955,"l2DailyTransactionCount":74,"l2DailyTokenVolume":293585,"l1LastBatchUploadTimestamp":1624792948000}}}',
      )
  })

  it('if date is null returns null', async () => {
    const transactionRepository = mockObject<TransactionRepository>({
      getCount: mockFn().returnsOnce(955),
      getCountSinceLast24h: mockFn().returnsOnce(74),
      getDailyTokenVolume: mockFn().returnsOnce(293585),
      getYoungestTransactionDate: mockFn().returnsOnce(null),
    })
    const router = createStatisticsRouter(transactionRepository)
    const server = createTestApiServer({ router })

    await server
      .get('/router.getOverview')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(
        200,
        '{"result":{"data":{"l2TransactionCount":955,"l2DailyTransactionCount":74,"l2DailyTokenVolume":293585,"l1LastBatchUploadTimestamp":null}}}',
      )
  })
})
