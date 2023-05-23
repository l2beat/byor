import { EthereumAddress, Hex, Unsigned64 } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'

import { AccountRepository } from './db/AccountRepository'
import { L1StateFetcher } from './L1StateFetcher'
import { L1StateManager } from './L1StateManager'

describe(L1StateManager.name, () => {
  describe(L1StateManager.prototype.start.name, () => {
    const modelTxSerializedHex = Hex(
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b',
    )

    it('triggers the update since the genesis block and updates database with execution result', async () => {
      const l1Fetcher = mockObject<L1StateFetcher>({
        getWholeState: mockFn().returnsOnce([
          {
            poster: '0xEcb9C375d3182853656221Bd2d01c14850d52D81',
            calldata: modelTxSerializedHex,
          },
        ]),
      })
      const accountRepository = mockObject<AccountRepository>({
        addOrUpdateMany: mockFn().returnsOnce([]),
        getAll: mockFn().returnsOnce([
          {
            address: EthereumAddress(
              '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            ),
            balance: Unsigned64(1000),
            nonce: Unsigned64(0),
          },
        ]),
      })
      const l1Manager = new L1StateManager(accountRepository, l1Fetcher)

      await l1Manager.start()

      expect(l1Fetcher.getWholeState).toHaveBeenCalledTimes(1)
      expect(accountRepository.getAll).toHaveBeenCalledTimes(1)
      expect(accountRepository.addOrUpdateMany).toHaveBeenOnlyCalledWith([
        {
          address: EthereumAddress(
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          ),
          balance: Unsigned64(988),
          nonce: Unsigned64(1),
        },
        {
          address: EthereumAddress(
            '0xEcb9C375d3182853656221Bd2d01c14850d52D81',
          ),
          balance: Unsigned64(2),
          nonce: Unsigned64(0),
        },
        {
          address: EthereumAddress(
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          ),
          balance: Unsigned64(10),
          nonce: Unsigned64(0),
        },
      ])
    })
  })
})
