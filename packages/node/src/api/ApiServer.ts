import { Logger } from '@byor/shared'
import { AnyRouter, ProcedureRouterRecord } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import http from 'http'

import { router } from './trpc'

export class ApiServer {
  private readonly router: AnyRouter
  private readonly httpServer: http.Server
  private readonly listenCallback: (port: number) => void

  constructor(
    private readonly port: number,
    private readonly logger: Logger,
    routers: ProcedureRouterRecord,
  ) {
    this.logger = logger.for(this)
    this.router = router(routers)

    const server = createHTTPServer({
      router: this.router,
    })

    this.httpServer = server.server
    this.listenCallback = server.listen
  }

  listen(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.logger.info('Listening', { port: this.port })
      resolve()

      this.listenCallback(this.port)
    })
  }

  getHTTPServer(): http.Server {
    return this.httpServer
  }
}
