import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { RootRouter } from '../../node/src/api/types/AppRouter'

export const trpc = createTRPCNext<RootRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: 'http://localhost:3000',
        }),
      ],
      ssr: true,
    }
  },
})
