import { Logger } from '@byor/shared'
import { AnyRouter } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import http from 'http'

import { AppRouter, makeRouter } from './types/AppRouter'

export class ApiServer {
  private readonly router: AnyRouter
  private readonly httpServer: http.Server
  private readonly listenCallback: (port: number) => void

  constructor(
    private readonly port: number,
    private readonly logger: Logger,
    routers: AppRouter,
  ) {
    this.logger = logger.for(this)
    this.router = makeRouter(routers)

    const server = createHTTPServer({
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
