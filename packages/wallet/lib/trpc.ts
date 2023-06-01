import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { AppRouter } from '../../node/src/api/types/AppRouter'

export const trpc = createTRPCNext<AppRouter>({
    config() {
        return {
            links: [
                httpBatchLink({
                    url: "http://localhost:3000",
                })
            ],
            ssr: true,
        }
    }
})
