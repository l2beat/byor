import fs from 'fs'

export function getGenesisState(path: string): Record<string, number> {
  const jsonContent = fs.readFileSync(path, 'utf-8')
  return JSON.parse(jsonContent) as Record<string, number>
}
