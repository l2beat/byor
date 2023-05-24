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
    // TODO(radomski): DI?
    const _port = this.port
    const _logger = this.logger

    return new Promise<void>((resolve) => {
      createHTTPServer({
        router: this.router,
        createContext() {
          _logger.info(`Listening on port ${_port}`)
          resolve()
        },
      }).listen(this.port)
    })
  }
}
