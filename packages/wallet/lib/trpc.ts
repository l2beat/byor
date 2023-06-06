import { RootRouter } from '@byor/node'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'

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
