import { command, run } from 'cmd-ts'

import { Application } from './Application'
import { getConfig } from './config'

export type { RootRouter } from './api/types/AppRouter'

async function main(): Promise<void> {
  const config = getConfig()
  const app = new Application(config)
  await app.start()
}

const cmd = command({
  name: 'node',
  description: 'L2 Node for a sovereign rollup',
  version: '1.0.0',
  args: {},
  handler: main,
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.error(e)
  process.exit(1)
})
