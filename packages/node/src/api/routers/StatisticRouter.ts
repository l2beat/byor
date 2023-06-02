import { publicProcedure, router } from '../trpc'

// NOTE(radomski): We need to propagte the return type
// from this function, we can not infer it
// eslint-disable-next-line
export function createStatisticsRouter() {
  return router({
    getOverview: publicProcedure.query(() => {
      return {
        l2TransactionCount: 955,
        l2DailyTransactionCount: 74,
        l2DailyTokenVolume: 293585,
        l1LastBatchUploadTimestamp: 1624792948,
      }
    }),
  })
}
