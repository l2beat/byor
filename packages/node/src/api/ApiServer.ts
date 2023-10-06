import { Logger } from '@l2beat/backend-tools'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import cors from 'cors'
import http from 'http'

import { AppRouters, makeRouter, RootRouter } from './types/AppRouter'

export class ApiServer {
  private readonly router: RootRouter
  private readonly httpServer: http.Server
  private readonly listenCallback: (port: number) => void

  constructor(
    private readonly port: number,
    private readonly logger: Logger,
    routers: AppRouters,
  ) {
    this.logger = logger.for(this)
    this.router = makeRouter(routers)

    const server = createHTTPServer({
      middleware: cors(),
      router: this.router,
    })

    this.httpServer = server.server
    this.listenCallback = server.listen
  }

  listen(): void {
    this.logger.info('Listening', { port: this.port })
    this.listenCallback(this.port)
  }

  getHTTPServer(): http.Server {
    return this.httpServer
  }
}
