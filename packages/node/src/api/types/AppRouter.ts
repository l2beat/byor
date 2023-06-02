import { ProcedureRouterRecord } from '@trpc/server'

import { createAccountRouter } from '../routers/AccountRouter'
import { createStatisticsRouter } from '../routers/StatisticRouter'
import { createTransactionRouter } from '../routers/TransactionRouter'
import { router } from '../trpc'

export interface AppRouters extends ProcedureRouterRecord {
  accounts: ReturnType<typeof createAccountRouter>
  transactions: ReturnType<typeof createTransactionRouter>
  statistics: ReturnType<typeof createStatisticsRouter>
}

// NOTE(radomski): We need to propagte the return type
// from this function, we can not infer it
// eslint-disable-next-line
export function makeRouter(routes: AppRouters) {
  return router(routes)
}

export type RootRouter = ReturnType<typeof makeRouter>
