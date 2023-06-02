import { createStatisticsRouter } from './StatisticRouter'
import { createTestApiServer } from './test/createTestApiServer'

describe(createStatisticsRouter.name, () => {
  it('if data is accepted returns success', async () => {
    const router = createStatisticsRouter()
    const server = createTestApiServer({ router })

    await server
      .get('/router.getOverview')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(
        200,
        '{"result":{"data":{"l2TransactionCount":955,"l2DailyTransactionCount":74,"l2DailyTokenVolume":293585,"l1LastBatchUploadTimestamp":1624792948}}}',
      )
  })
})
