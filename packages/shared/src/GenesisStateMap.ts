import fs from 'fs'

export type GenesisStateMap = Record<string, number>

export function getGenesisState(path: string): GenesisStateMap {
  const jsonContent = fs.readFileSync(path, 'utf-8')
  const genesisState = JSON.parse(jsonContent) as GenesisStateMap

  return genesisState
}
