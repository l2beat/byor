import { EthereumAddress, Hex } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'
import { parseAbiItem } from 'viem'

import { Config } from './config'
import { L1StateFetcher } from './L1StateFetcher'
import { EthereumClient } from './peripherals/ethereum/EthereumClient'

describe(L1StateFetcher.name, () => {
  describe(L1StateFetcher.prototype.getWholeState.name, () => {
    it('decodes correct event and transaction data', async () => {
      const config = mockObject<Config>({
        ctcContractAddress: EthereumAddress(
          '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        ),
      })
      const client = mockObject<EthereumClient>({
        getLogsSinceGenesis: mockFn().returnsOnce([
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
      const l1Fetcher = new L1StateFetcher(config, client)

      const result = await l1Fetcher.getWholeState()

      expect(client.getLogsSinceGenesis).toHaveBeenCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
      )
      expect(result).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0xaabbccddeeff'),
        },
      ])
    })

    it('accepts empty calldata', async () => {
      const config = mockObject<Config>({
        ctcContractAddress: EthereumAddress(
          '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        ),
      })
      const client = mockObject<EthereumClient>({
        getLogsSinceGenesis: mockFn().returnsOnce([
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
      const l1Fetcher = new L1StateFetcher(config, client)

      const result = await l1Fetcher.getWholeState()

      expect(client.getLogsSinceGenesis).toHaveBeenCalledWith(
        parseAbiItem('event BatchAppended(address sender)'),
        EthereumAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
      )
      expect(result).toEqual([
        {
          poster: EthereumAddress('0xF6431Fc84dbb761c0cc3825362EeA71c2AfAf2a3'),
          calldata: Hex('0x0'),
        },
      ])
    })

    it('throws when the calldata is an encoded number instead of bytes', async () => {
      const config = mockObject<Config>({
        ctcContractAddress: EthereumAddress(
          '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        ),
      })
      const client = mockObject<EthereumClient>({
        getLogsSinceGenesis: mockFn().returnsOnce([
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
      const l1Fetcher = new L1StateFetcher(config, client)

      await expect(l1Fetcher.getWholeState).toBeRejected()
    })

    it('throws when the calldata is not a multiple of 32', async () => {
      const config = mockObject<Config>({
        ctcContractAddress: EthereumAddress(
          '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        ),
      })
      const client = mockObject<EthereumClient>({
        getLogsSinceGenesis: mockFn().returnsOnce([
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
      const l1Fetcher = new L1StateFetcher(config, client)

      await expect(l1Fetcher.getWholeState).toBeRejected()
    })
  })
})
