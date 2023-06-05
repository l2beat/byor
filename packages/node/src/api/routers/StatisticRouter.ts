import { TransactionRepository } from '../../db/TransactionRepository'
import { publicProcedure, router } from '../trpc'

// NOTE(radomski): We need to propagte the return type
// from this function, we can not infer it
// eslint-disable-next-line
export function createStatisticsRouter(txRepository: TransactionRepository) {
  return router({
    getOverview: publicProcedure.query(() => {
      const date = txRepository.getYoungestTransactionDate()
      const timestamp = date ? date.getTime() : null

      return {
        l2TransactionCount: txRepository.getCount(),
        l2DailyTransactionCount: txRepository.getCountSinceLast24h(),
        l2DailyTokenVolume: txRepository.getDailyTokenVolume(),
        l1LastBatchUploadTimestamp: timestamp,
      }
    }),
  })
}
