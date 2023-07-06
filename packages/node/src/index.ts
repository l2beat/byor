import { command, positional, run, string } from 'cmd-ts'

import { Application } from './Application'
import { getConfig } from './config'

export type { RootRouter } from './api/types/AppRouter'

/**
 * Main entry point. It reads the config file and starts the node.
 */
async function main(configPath: string): Promise<void> {
  const config = getConfig(configPath)
  const app = new Application(config)
  await app.start()
}

/**
 * Command line interface of the program. There is a single argument, the
 * path to the config file.
 */
const cmd = command({
  name: 'node',
  description: 'L2 Node for a sovereign rollup',
  version: '1.0.0',
  args: {
    configPath: positional({ type: string, displayName: 'configPath' }),
  },
  handler: (args) => main(args.configPath),
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.error(e)
  process.exit(1)
})
