import { ProcedureRouterRecord } from '@trpc/server'
import { createAccountRouter } from '../routers/AccountRouter'
import { createStatisticsRouter } from '../routers/StatisticRouter'
import { createTransactionRouter } from '../routers/TransactionRouter'
import { router } from '../trpc'

export interface AppRouter extends ProcedureRouterRecord {
  accounts: ReturnType<typeof createAccountRouter>
  transactions: ReturnType<typeof createTransactionRouter>
  statistics: ReturnType<typeof createStatisticsRouter>
}

export function makeRouter(routes: AppRouter) {
  return router(routes)
}

export type RootRouter = ReturnType<typeof makeRouter>
