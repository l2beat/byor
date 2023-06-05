import { EthereumAddress, Hex, Logger } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'
import { Hex as ViemHex, parseAbiItem, PublicClient } from 'viem'

import { EthereumClient } from './EthereumClient'

describe(EthereumClient.name, () => {
  describe(EthereumClient.prototype.getLogsInRange.name, () => {
    it('gets the log starting from the genesis block', async () => {
      const provider = mockObject<PublicClient>({
        getLogs: mockFn().returnsOnce([]),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)
      const eventAbi = parseAbiItem('event BatchAppended(address sender)')

      await ethereumClient.getLogsInRange(eventAbi, EthereumAddress.ZERO, 42n)

      expect(provider.getLogs).toHaveBeenCalledWith({
        address: EthereumAddress.ZERO.toString() as ViemHex,
        event: eventAbi,
        fromBlock: 42n,
        toBlock: undefined,
      })
    })
  })

  describe(EthereumClient.prototype.getTransaction.name, () => {
    it('gets the log starting from the genesis block', async () => {
      const provider = mockObject<PublicClient>({
        getTransaction: mockFn().returnsOnce([]),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)

      await ethereumClient.getTransaction(Hex('0x1234'))

      expect(provider.getTransaction).toHaveBeenCalledWith({
        hash: '0x1234',
      })
    })
  })

  describe(EthereumClient.prototype.getBlockHeader.name, () => {
    it('gets the log starting from the genesis block', async () => {
      const provider = mockObject<PublicClient>({
        getBlock: mockFn().returnsOnce([]),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)

      await ethereumClient.getBlockHeader(Hex('0x1234'))

      expect(provider.getBlock).toHaveBeenCalledWith({
        blockHash: '0x1234',
      })
    })
  })
})
