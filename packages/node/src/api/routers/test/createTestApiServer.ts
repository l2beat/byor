import { Logger } from '@byor/shared'
import { ProcedureRouterRecord } from '@trpc/server'
import { agent, SuperAgentTest } from 'supertest'

import { ApiServer } from '../../ApiServer'

export function createTestApiServer(
  routers: ProcedureRouterRecord,
): SuperAgentTest {
  const server = new ApiServer(0, Logger.SILENT, routers).getHTTPServer()
  return agent(server)
}
