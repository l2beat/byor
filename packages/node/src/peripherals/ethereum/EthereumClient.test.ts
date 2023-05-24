import { Hex, Logger } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'
import { parseAbiItem, PublicClient } from 'viem'

import { EthereumClient } from './EthereumClient'

describe(EthereumClient.name, () => {
  describe(EthereumClient.prototype.getLogsSinceGenesis.name, () => {
    it('gets the log starting from the genesis block', async () => {
      const provider = mockObject<PublicClient>({
        getLogs: mockFn().returnsOnce([]),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)
      const eventAbi = parseAbiItem('event BatchAppended(address sender)')

      await ethereumClient.getLogsSinceGenesis(eventAbi, Hex('0x1234'))

      expect(provider.getLogs).toHaveBeenCalledWith({
        event: eventAbi,
        address: '0x1234',
        fromBlock: 0n,
        toBlock: undefined,
      })
    })
  })
})
