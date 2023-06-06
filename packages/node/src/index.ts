import { command, positional, run, string } from 'cmd-ts'

import { Application } from './Application'
import { getConfig } from './config'

export type { RootRouter } from './api/types/AppRouter'

const cmd = command({
  name: 'node',
  description: 'L2 Node for a sovereign rollup',
  version: '1.0.0',
  args: {
    configPath: positional({ type: string, displayName: 'configPath' }),
  },
  handler: async ({ configPath }) => {
    await main(configPath)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
  process.exit(1)
})

async function main(configPath: string): Promise<void> {
  const config = getConfig(configPath)
  const app = new Application(config)
  await app.start()
}
