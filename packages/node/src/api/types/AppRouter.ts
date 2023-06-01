import { createAccountRouter } from '../routers/AccountRouter'
import { createTransactionRouter } from '../routers/TransactionRouter'
import { router } from '../trpc'

export function makeRouter(routes: AppRouter) {
  return router(routes)
}

export type AppRouter = {
  accounts: ReturnType<typeof createAccountRouter>
  transactions: ReturnType<typeof createTransactionRouter>
}

export type RootRouter = ReturnType<typeof makeRouter>
