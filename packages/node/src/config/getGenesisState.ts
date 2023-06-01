import { GenesisStateMap } from '@byor/shared'

import fs from 'fs'

export function getGenesisState(path: string): GenesisStateMap {
  const jsonContent = fs.readFileSync(path, 'utf-8')
  const genesisState = JSON.parse(jsonContent) as GenesisStateMap

  return genesisState
}
