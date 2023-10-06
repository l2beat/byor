import { EthereumAddress, Hex } from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'
import { expect, mockFn, mockObject } from 'earl'
import { parseAbiItem, PublicClient } from 'viem'

import { EthereumClient } from './EthereumClient'

describe(EthereumClient.name, () => {
  describe(EthereumClient.prototype.getLogsInRange.name, () => {
    it('divides on throw into two equal calls', async () => {
      const provider = mockObject<PublicClient>({
        getLogs: mockFn()
          .throwsOnce(new Error('block range is too wide'))
          .returnsOnce([])
          .returnsOnce([]),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)
      const eventAbi = parseAbiItem('event BatchAppended(address sender)')

      await ethereumClient.getLogsInRange(
        eventAbi,
        EthereumAddress.ZERO,
        1000n,
        2000n,
      )

      expect(provider.getLogs).toHaveBeenCalledTimes(3)
      expect(provider.getLogs).toHaveBeenCalledWith({
        address: EthereumAddress.ZERO.toString(),
        event: eventAbi,
        fromBlock: 1000n,
        toBlock: 2000n,
      })
      expect(provider.getLogs).toHaveBeenCalledWith({
        address: EthereumAddress.ZERO.toString(),
        event: eventAbi,
        fromBlock: 1000n,
        toBlock: 1500n,
      })
      expect(provider.getLogs).toHaveBeenCalledWith({
        address: EthereumAddress.ZERO.toString(),
        event: eventAbi,
        fromBlock: 1501n,
        toBlock: 2000n,
      })
    })

    it('gets the log starting from the genesis block', async () => {
      const provider = mockObject<PublicClient>({
        getLogs: mockFn().returnsOnce([]),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)
      const eventAbi = parseAbiItem('event BatchAppended(address sender)')

      await ethereumClient.getLogsInRange(eventAbi, EthereumAddress.ZERO, 42n)

      expect(provider.getLogs).toHaveBeenCalledWith({
        address: EthereumAddress.ZERO.toString(),
        event: eventAbi,
        fromBlock: 42n,
        toBlock: undefined,
      })
    })

    it('throws if the error does not originate from too wide of a range', async () => {
      const provider = mockObject<PublicClient>({
        getLogs: mockFn().throwsOnce(new Error('wrong api key')),
      })
      const ethereumClient = new EthereumClient(provider, Logger.SILENT)
      const eventAbi = parseAbiItem('event BatchAppended(address sender)')

      await expect(
        ethereumClient.getLogsInRange(eventAbi, EthereumAddress.ZERO, 1n, 2n),
      ).toBeRejectedWith('wrong api key')
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
