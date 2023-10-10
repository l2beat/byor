import { EthereumAddress, Hex } from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'
import { expect, mockFn, mockObject } from 'earl'
import { parseAbiItem } from 'viem'

import { FetcherRepository } from '../peripherals/database/FetcherRepository'
import { EthereumClient } from '../peripherals/ethereum/EthereumClient'
import { BatchDownloader } from './BatchDownloader'

describe(BatchDownloader.name, () => {
  describe(BatchDownloader.prototype.getNewBatches.name, () => {
    it('decodes correct event and transaction data while keeping track of last block number', async () => {
      const ctcContractAddress = EthereumAddress(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      )
      const fetcherRepository = mockObject<FetcherRepository>({
        addOrUpdate: async () => undefined,
        getByChainIdOrDefault: async () => ({
          chainId: 1337,
          lastFetchedBlock: 100n,
        }),
      })
      const logs = [
        {
          args: {
            sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
          },
          transactionHash: '0xaabb',
          blockHash: '0xaabbaabb',
          blockNumber: 11n,
        },
        {
          args: {
            sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
          },
          transactionHash: '0xffee',
          blockHash: '0xffeeffee',
          blockNumber: 17n,
        },
        {
          args: {
            sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
          },
          transactionHash: '0xbbcc',
          blockHash: '0xbbccbbcc',
          blockNumber: 12n,
        },
      ]
      const client = mockObject<EthereumClient>({
        getBlockNumber: async () => 1234n,
        getChainId: () => 1337,
        getLogsInRange: async () => logs as any,
        getTransaction: mockFn()
          .returnsOnce({
            input:
              '0x96677ca20000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000caaaabbbbccccddddeeeeffff0000000000000000000000000000000000000000',
          })
          .returnsOnce({
            input:
              '0x96677ca200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006ffeeddccbbaa0000000000000000000000000000000000000000000000000000',
          })
          .returnsOnce({
            input:
              '0x96677ca20000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000cffffeeeeddddccccbbbbaaaa0000000000000000000000000000000000000000',
          }),
        getBlockHeader: mockFn()
          .returnsOnce({ timestamp: 1645878310n })
          .returnsOnce({ timestamp: 1608293972n })
          .returnsOnce({ timestamp: 1749685967n }),
      })
      const batchDownloader = new BatchDownloader(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      await batchDownloader.start()
      const events = await batchDownloader.getNewBatches()

      expect(client.getLogsInRange).toHaveBeenOnlyCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        101n,
        1234n - 15n, // TODO: make this obvious
      )
      expect(events).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xaaaabbbbccccddddeeeeffff'),
          timestamp: new Date(1645878310 * 1000),
        },
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xffeeddccbbaa'),
          timestamp: new Date(1608293972 * 1000),
        },
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xffffeeeeddddccccbbbbaaaa'),
          timestamp: new Date(1749685967 * 1000),
        },
      ])
      // TODO: make this obvious
      expect(batchDownloader.getLastFetchedBlock()).toEqual(1234n - 15n)
    })

    it('decodes correct event and transaction data', async () => {
      const ctcContractAddress = EthereumAddress(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      )
      const fetcherRepository = mockObject<FetcherRepository>({
        addOrUpdate: mockFn().returns(null),
        getByChainIdOrDefault: mockFn().returnsOnce({
          chainId: 1337,
          lastFetchedBlock: 0n,
        }),
      })
      const client = mockObject<EthereumClient>({
        getBlockNumber: mockFn().returns(1234n),
        getChainId: mockFn().returns(1337),
        getLogsInRange: mockFn().returnsOnce([
          {
            args: {
              sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
            },
            transactionHash: '0x1234',
            blockHash: '0x12341234',
          },
        ]),
        getTransaction: mockFn().returnsOnce({
          input:
            '0x96677ca200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006aabbccddeeff0000000000000000000000000000000000000000000000000000',
        }),
        getBlockHeader: mockFn().returnsOnce({ timestamp: 1646701020n }),
      })
      const batchDownloader = new BatchDownloader(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      const result = await batchDownloader.getNewBatches()

      expect(client.getLogsInRange).toHaveBeenOnlyCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        1n,
        1234n - 15n, // TODO: make this obvious
      )
      expect(result).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xaabbccddeeff'),
          timestamp: new Date(1646701020 * 1000),
        },
      ])
    })

    it('accepts empty calldata', async () => {
      const ctcContractAddress = EthereumAddress(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      )
      const fetcherRepository = mockObject<FetcherRepository>({
        addOrUpdate: mockFn().returns(null),
        getByChainIdOrDefault: mockFn().returnsOnce({
          chainId: 1337,
          lastFetchedBlock: 0n,
        }),
      })
      const client = mockObject<EthereumClient>({
        getBlockNumber: mockFn().returns(1234n),
        getChainId: mockFn().returns(1337),
        getLogsInRange: mockFn().returnsOnce([
          {
            args: {
              sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
            },
            transactionHash: '0x1234',
            blockHash: '0x12341234',
          },
        ]),
        getTransaction: mockFn().returnsOnce({
          input:
            '0x96677ca200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        }),
        getBlockHeader: mockFn().returnsOnce({ timestamp: 1646701020n }),
      })
      const batchDownloader = new BatchDownloader(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      const result = await batchDownloader.getNewBatches()

      expect(client.getLogsInRange).toHaveBeenOnlyCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        1n,
        1234n - 15n, // TODO: make this obvious
      )
      expect(result).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0x0'),
          timestamp: new Date(1646701020 * 1000),
        },
      ])
    })

    it('throws when the calldata is an encoded number instead of bytes', async () => {
      const ctcContractAddress = EthereumAddress(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      )
      const fetcherRepository = mockObject<FetcherRepository>({
        addOrUpdate: mockFn().returns(null),
        getByChainIdOrDefault: mockFn().returnsOnce({
          chainId: 1337,
          lastFetchedBlock: 0n,
        }),
      })
      const client = mockObject<EthereumClient>({
        getBlockNumber: mockFn().returns(1234n),
        getChainId: mockFn().returns(1337),
        getLogsInRange: mockFn().returnsOnce([
          {
            args: {
              sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
            },
            transactionHash: '0x1234',
          },
        ]),
        getTransaction: mockFn().returnsOnce({
          input:
            '0x96677ca20000000000000000000000000000000000000000000000000000000000000020',
        }),
      })
      const batchDownloader = new BatchDownloader(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      await expect(batchDownloader.getNewBatches()).toBeRejectedWith(
        'Slice starting at offset',
      )
    })

    it('throws when the calldata is not a multiple of 32', async () => {
      const ctcContractAddress = EthereumAddress(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      )
      const fetcherRepository = mockObject<FetcherRepository>({
        addOrUpdate: mockFn().returns(null),
        getByChainIdOrDefault: mockFn().returnsOnce({
          chainId: 1337,
          lastFetchedBlock: 0n,
        }),
      })
      const client = mockObject<EthereumClient>({
        getBlockNumber: mockFn().returns(1234n),
        getChainId: mockFn().returns(1337),
        getLogsInRange: mockFn().returnsOnce([
          {
            args: {
              sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
            },
            transactionHash: '0x1234',
          },
        ]),
        getTransaction: mockFn().returnsOnce({
          input: '0x96677ca2234567890',
        }),
      })
      const batchDownloader = new BatchDownloader(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      await expect(batchDownloader.getNewBatches()).toBeRejectedWith(
        'Data size of 5 bytes is too small for given parameters',
      )
    })
  })
})
