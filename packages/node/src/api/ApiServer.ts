import { Logger } from '@byor/shared'
import { AnyRouter, ProcedureRouterRecord } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'

import { router } from './trpc/trpc'

export class ApiServer {
  private readonly router: AnyRouter
  constructor(
    private readonly port: number,
    private readonly logger: Logger,
    routers: ProcedureRouterRecord,
  ) {
    this.logger = logger.for(this)
    this.router = router(routers)
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
