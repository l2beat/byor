import { RootRouter } from '@byor/node'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { inferRouterOutputs } from '@trpc/server'

type RouterOutput = inferRouterOutputs<RootRouter>
export type TransactionGetStatusOutput =
  RouterOutput['transactions']['getStatus']

export const trpc = createTRPCNext<RootRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: 'http://localhost:3000',
        }),
      ],
    }
  },
  ssr: true,
})
