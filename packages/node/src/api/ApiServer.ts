import { Logger } from '@byor/shared'
import { AnyRouter } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'

import { mergeRouters } from './trpc/trpc'

export class ApiServer {
  private readonly router: AnyRouter
  constructor(
    private readonly port: number,
    private readonly logger: Logger,
    routers: AnyRouter[],
  ) {
    this.logger = logger.for(this)
    this.router = mergeRouters(...routers)
  }

  listen(): Promise<void> {
    const server = createHTTPServer({
      router: this.router,
      createContext() {
        return {}
      },
    })

    return new Promise<void>((resolve) => {
      this.logger.info('Listening', { port: this.port })
      resolve()

      server.listen(this.port)
    })
  }
}
