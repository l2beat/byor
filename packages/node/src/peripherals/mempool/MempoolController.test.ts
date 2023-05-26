import {
  assert,
  EthereumAddress,
  Hex,
  Logger,
  serializeAndSign,
  Transaction,
  Unsigned64,
} from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'
import { privateKeyToAccount } from 'viem/accounts'

import { L1StateManager } from '../../L1StateManager'
import { Mempool } from './Mempool'
import { MempoolController } from './MempoolController'

describe(MempoolController.name, () => {
  describe(MempoolController.prototype.tryToAdd.name, () => {
    const modelAccount1 = privateKeyToAccount(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    )
    const modelAccount2 = privateKeyToAccount(
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    )

    const modelTx1: Transaction = {
      from: EthereumAddress(modelAccount1.address),
      to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
      value: Unsigned64(10),
      nonce: Unsigned64(1),
      fee: Unsigned64(2),
    }
    const modelTx2: Transaction = {
      from: EthereumAddress(modelAccount1.address),
      to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
      value: Unsigned64(10),
      nonce: Unsigned64(2),
      fee: Unsigned64(2),
    }
    const modelTx3: Transaction = {
      from: EthereumAddress(modelAccount2.address),
      to: EthereumAddress(modelAccount1.address),
      value: Unsigned64(10),
      nonce: Unsigned64(1),
      fee: Unsigned64(2),
    }

    let modelTx1SerializedHex: Hex
    let modelTx2SerializedHex: Hex
    let modelTx3SerializedHex: Hex

    beforeEach(async () => {
      modelTx1SerializedHex = await serializeAndSign(modelTx1, modelAccount1)
      modelTx2SerializedHex = await serializeAndSign(modelTx2, modelAccount1)
      modelTx3SerializedHex = await serializeAndSign(modelTx3, modelAccount2)
    })

    it('handles new commited state with which mempool txs fully apply', async () => {
      let l1ManagerCommitStateCallback: any = undefined
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          l1ManagerCommitStateCallback = callback
          l1ManagerCommitStateCallback()
          return l1Manager
        }),
        getState: mockFn()
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 100n,
              nonce: 0n,
            },
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
              balance: 500n,
              nonce: 0n,
            },
          })
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 88n,
              nonce: 1n,
            },
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
              balance: 0n,
              nonce: 1n,
            },
          }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([])
          .returnsOnce([modelTx2SerializedHex, modelTx3SerializedHex]),
        empty: mockFn().returns([]),
        add: mockFn().returns([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )

      await mempoolController.tryToAdd(modelTx1SerializedHex)
      await mempoolController.tryToAdd(modelTx2SerializedHex)
      assert(l1ManagerCommitStateCallback !== undefined)
      l1ManagerCommitStateCallback()
      await mempoolController.updateStateIfNewCommited()

      expect(mempool.add).toHaveBeenCalledWith(modelTx1SerializedHex)
      expect(mempool.add).toHaveBeenCalledWith(modelTx2SerializedHex)
      expect(mempool.empty).toHaveBeenCalledTimes(2)
      console.log('tests end')
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(76n),
          nonce: Unsigned64(2n),
        },
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
          balance: Unsigned64(10n),
          nonce: Unsigned64(1n),
        },
        '0x0000000000000000000000000000000000000000': {
          balance: Unsigned64(2n),
          nonce: Unsigned64(0n),
        },
      })
    })

    it('handles new commited state with which mempool txs semi-apply', async () => {
      let l1ManagerCommitStateCallback: any = undefined
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          l1ManagerCommitStateCallback = callback
          l1ManagerCommitStateCallback()
          return l1Manager
        }),
        getState: mockFn()
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 100n,
              nonce: 0n,
            },
          })
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 2n,
              nonce: 3n,
            },
          }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([])
          .returnsOnce([modelTx2SerializedHex]),
        empty: mockFn().returns([]),
        add: mockFn().returns([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )

      await mempoolController.tryToAdd(modelTx1SerializedHex)
      await mempoolController.tryToAdd(modelTx2SerializedHex)
      await mempoolController.tryToAdd(modelTx3SerializedHex)
      assert(l1ManagerCommitStateCallback !== undefined)
      l1ManagerCommitStateCallback()
      await mempoolController.updateStateIfNewCommited()

      expect(mempool.add).toHaveBeenCalledWith(modelTx1SerializedHex)
      expect(mempool.add).toHaveBeenCalledWith(modelTx2SerializedHex)
      expect(mempool.empty).toHaveBeenCalledTimes(2)
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(2n),
          nonce: Unsigned64(3n),
        },
      })
    })

    it('adds a single transaction to the mempool', async () => {
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          callback()
          return l1Manager
        }),
        getState: mockFn().returnsOnce({
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
            balance: 100n,
            nonce: 0n,
          },
        }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        empty: mockFn().returnsOnce([]),
        add: mockFn().returnsOnce([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )

      await mempoolController.tryToAdd(modelTx1SerializedHex)

      expect(mempool.add).toHaveBeenOnlyCalledWith(modelTx1SerializedHex)
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(88n),
          nonce: Unsigned64(1n),
        },
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
          balance: Unsigned64(10n),
          nonce: Unsigned64(0n),
        },
        '0x0000000000000000000000000000000000000000': {
          balance: Unsigned64(2n),
          nonce: Unsigned64(0n),
        },
      })
    })

    it('adds two batched transactions to the mempool', async () => {
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          callback()
          return l1Manager
        }),
        getState: mockFn().returnsOnce({
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
            balance: 100n,
            nonce: 0n,
          },
        }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        empty: mockFn().returnsOnce([]),
        add: mockFn().returnsOnce([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )
      const batch = Hex(
        Hex.removePrefix(modelTx1SerializedHex) +
          Hex.removePrefix(modelTx2SerializedHex),
      )

      await mempoolController.tryToAdd(batch)

      expect(mempool.add).toHaveBeenOnlyCalledWith(batch)
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(76n),
          nonce: Unsigned64(2n),
        },
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
          balance: Unsigned64(20n),
          nonce: Unsigned64(0n),
        },
        '0x0000000000000000000000000000000000000000': {
          balance: Unsigned64(4n),
          nonce: Unsigned64(0n),
        },
      })
    })

    it('throws on balance too low', async () => {
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          callback()
          return l1Manager
        }),
        getState: mockFn().returnsOnce({
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
            balance: 0n,
            nonce: 0n,
          },
        }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        empty: mockFn().returnsOnce([]),
        add: mockFn().returnsOnce([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )

      await expect(
        mempoolController.tryToAdd(modelTx1SerializedHex),
      ).toBeRejectedWith('Assertion Error')

      expect(mempool.add).toHaveBeenCalledTimes(0)
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(0n),
          nonce: Unsigned64(0n),
        },
      })
    })

    it('throws on wrong nonce', async () => {
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          callback()
          return l1Manager
        }),
        getState: mockFn().returnsOnce({
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
            balance: 100n,
            nonce: 6000n,
          },
        }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        empty: mockFn().returnsOnce([]),
        add: mockFn().returnsOnce([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )

      await expect(
        mempoolController.tryToAdd(modelTx1SerializedHex),
      ).toBeRejectedWith('Assertion Error')

      expect(mempool.add).toHaveBeenCalledTimes(0)
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(100n),
          nonce: Unsigned64(6000n),
        },
      })
    })

    it('throws on bytes that cannot be deserialized to a transaction', async () => {
      const l1Manager = mockObject<L1StateManager>({
        on: mockFn((_: string, callback: any): L1StateManager => {
          callback()
          return l1Manager
        }),
        getState: mockFn().returnsOnce({
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
            balance: 100n,
            nonce: 6000n,
          },
        }),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn().returnsOnce([]),
        empty: mockFn().returnsOnce([]),
        add: mockFn().returnsOnce([]),
      })
      const mempoolController = new MempoolController(
        l1Manager,
        mempool,
        Logger.SILENT,
      )

      await expect(mempoolController.tryToAdd(Hex('0x1234'))).toBeRejectedWith(
        'is not multiple of SIGNED_TX_HEX_SIZE',
      )

      expect(mempool.add).toHaveBeenCalledTimes(0)
      expect(mempoolController.getState()).toEqual({
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
          balance: Unsigned64(100n),
          nonce: Unsigned64(6000n),
        },
      })
    })
  })
})
