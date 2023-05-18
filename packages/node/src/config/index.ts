import fs from 'fs'

import { Config } from './Config'

export type { Config }

export function getConfig(configPath: string): Config {
  const jsonContent = fs.readFileSync(configPath, 'utf-8')
  const config = JSON.parse(jsonContent) as Config

  return config
}
