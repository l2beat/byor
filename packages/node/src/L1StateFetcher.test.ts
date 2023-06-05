import { EthereumAddress, Hex, Logger } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'
import { parseAbiItem } from 'viem'

import { FetcherRepository } from './db/FetcherRepository'
import { L1StateFetcher } from './L1StateFetcher'
import { EthereumClient } from './peripherals/ethereum/EthereumClient'

describe(L1StateFetcher.name, () => {
  describe(L1StateFetcher.prototype.getNewState.name, () => {
    it('decodes correct event and transaction data while keeping track of last block number', async () => {
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
        getChainId: mockFn().returns(1337),
        getLogsInRange: mockFn()
          .returnsOnce([
            {
              args: {
                sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
              },
              transactionHash: '0x1234',
              blockNumber: 10n,
            },
          ])
          .returnsOnce([
            {
              args: {
                sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
              },
              transactionHash: '0xaabb',
              blockNumber: 11n,
            },
            {
              args: {
                sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
              },
              transactionHash: '0xffee',
              blockNumber: 17n,
            },
            {
              args: {
                sender: '0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3',
              },
              transactionHash: '0xbbcc',
              blockNumber: 12n,
            },
          ])
          .returnsOnce([]),
        getTransaction: mockFn()
          .returnsOnce({
            input:
              '0x96677ca200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006aabbccddeeff0000000000000000000000000000000000000000000000000000',
          })
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
      })
      const l1Fetcher = new L1StateFetcher(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      const genesis = await l1Fetcher.getNewState()
      const update1 = await l1Fetcher.getNewState()
      const update2 = await l1Fetcher.getNewState()

      expect(client.getLogsInRange).toHaveBeenNthCalledWith(
        1,
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        1n,
      )
      expect(client.getLogsInRange).toHaveBeenNthCalledWith(
        2,
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        11n,
      )
      expect(client.getLogsInRange).toHaveBeenNthCalledWith(
        3,
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        18n,
      )
      expect(genesis).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xaabbccddeeff'),
        },
      ])
      expect(update1).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xaaaabbbbccccddddeeeeffff'),
        },
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xffeeddccbbaa'),
        },
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xffffeeeeddddccccbbbbaaaa'),
        },
      ])
      expect(update2).toEqual([])
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
            '0x96677ca200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006aabbccddeeff0000000000000000000000000000000000000000000000000000',
        }),
      })
      const l1Fetcher = new L1StateFetcher(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      const result = await l1Fetcher.getNewState()

      expect(client.getLogsInRange).toHaveBeenCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        1n,
      )
      expect(result).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xaabbccddeeff'),
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
            '0x96677ca200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        }),
      })
      const l1Fetcher = new L1StateFetcher(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      const result = await l1Fetcher.getNewState()

      expect(client.getLogsInRange).toHaveBeenCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
        1n,
      )
      expect(result).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0x0'),
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
      const l1Fetcher = new L1StateFetcher(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      await expect(l1Fetcher.getNewState()).toBeRejectedWith(
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
      const l1Fetcher = new L1StateFetcher(
        client,
        fetcherRepository,
        ctcContractAddress,
        Logger.SILENT,
      )

      await expect(l1Fetcher.getNewState()).toBeRejectedWith(
        'Size must be in increments of 32 bytes',
      )
    })
  })
})
