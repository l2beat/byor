import { Config } from './Config'
import { getLocalConfig } from './config.local'
import { getProductionConfig } from './config.production'

export type { Config }

export function getConfig(): Config {
  const env =
    process.env.DEPLOYMENT_ENV ??
    (process.env.NODE_ENV === 'production' ? 'production' : 'local')
  console.log('Loading config for:', env)

  switch (env) {
    case 'local':
      return getLocalConfig()
    case 'production':
      return getProductionConfig()
  }

  throw new TypeError(`Unrecognized env: ${env}!`)
}
