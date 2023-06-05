import { TransactionRepository } from '../../db/TransactionRepository'
import { publicProcedure, router } from '../trpc'

// NOTE(radomski): We need to propagte the return type
// from this function, we can not infer it
// eslint-disable-next-line
export function createStatisticsRouter(
  transactionRepository: TransactionRepository,
) {
  return router({
    getOverview: publicProcedure.query(() => {
      return {
        l2TransactionCount: transactionRepository.getCount(),
        l2DailyTransactionCount: transactionRepository.getCountSinceLast24h(),
        l2DailyTokenVolume: 293585,
        l1LastBatchUploadTimestamp: 1624792948,
      }
    }),
  })
}
