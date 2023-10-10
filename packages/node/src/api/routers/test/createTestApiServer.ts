import { Logger } from '@l2beat/backend-tools'
import { ProcedureRouterRecord } from '@trpc/server'
import { agent, SuperAgentTest } from 'supertest'

import { ApiServer } from '../../ApiServer'

export function createTestApiServer(
  routers: ProcedureRouterRecord,
): SuperAgentTest {
  // NOTE(radomski): Types here are not going to play nicely,
  // but it's for testing purposes only
  // eslint-disable-next-line
  const server = new ApiServer(0, Logger.SILENT, routers as any).getHTTPServer()
  return agent(server)
}
