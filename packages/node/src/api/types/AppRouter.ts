import { createAccountRouter } from "../routers/AccountRouter"
import { createTransactionRouter } from "../routers/TransactionRouter"
import { router } from '../trpc'

export type AppRouter = {
  accounts: ReturnType<typeof createAccountRouter>
  transactions: ReturnType<typeof createTransactionRouter>
}

// export type AppRouter = ReturnType< typeof router({
//   accounts: createAccountRouter(undefined!),
//   transactions: createTransactionRouter(undefined!)
// })>
