import {
  EthereumAddress,
  Hex,
  Logger,
  serializeAndSign,
  Transaction,
  Unsigned64,
} from '@byor/shared'
import { install, InstalledClock } from '@sinonjs/fake-timers'
import { expect, mockFn, mockObject } from 'earl'
import { privateKeyToAccount } from 'viem/accounts'

import { L1StateManager } from './L1StateManager'
import { L1StateSubmitter } from './L1StateSubmitter'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'

describe(L1StateSubmitter.name, () => {
  const modelAccount = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  )

  const modelTx1: Transaction = {
    from: EthereumAddress(modelAccount.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(10),
    nonce: Unsigned64(1),
    fee: Unsigned64(2),
  }
  const modelTx2: Transaction = {
    from: EthereumAddress(modelAccount.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(10),
    nonce: Unsigned64(2),
    fee: Unsigned64(2),
  }

  let modelTx1SerializedHex: Hex
  let modelTx2SerializedHex: Hex

  let time: InstalledClock

  before(async () => {
    modelTx1SerializedHex = await serializeAndSign(modelTx1, modelAccount)
    modelTx2SerializedHex = await serializeAndSign(modelTx2, modelAccount)
  })

  beforeEach(async () => {
    time = install()
  })

  afterEach(() => {
    time.uninstall()
  })

  const FLUSH_PERIOD_SEC = 1

  describe(L1StateSubmitter.prototype.start.name, () => {
    it('submits transactions every flush period seconds', async () => {
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
      const client = mockObject<EthereumPrivateClient>({
        writeToCTCContract: mockFn().returns(null),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([modelTx1SerializedHex])
          .returnsOnce([modelTx2SerializedHex]),
        empty: mockFn().returns(null),
      })
      const l1Submitter = new L1StateSubmitter(
        FLUSH_PERIOD_SEC,
        l1Manager,
        client,
        mempool,
        Logger.SILENT,
      )
      l1Submitter.start()
      await time.tickAsync(FLUSH_PERIOD_SEC * 3000)

      expect(mempool.empty).toHaveBeenCalledTimes(2)
      expect(mempool.getTransactionsInPool).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        1,
        modelTx1SerializedHex,
      )
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        2,
        modelTx2SerializedHex,
      )
    })

    it('does not submit empty transactions', async () => {
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
          .returns({
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
      const client = mockObject<EthereumPrivateClient>({
        writeToCTCContract: mockFn().returns(null),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([modelTx1SerializedHex])
          .returnsOnce([])
          .returnsOnce([modelTx2SerializedHex]),
        empty: mockFn().returns(null),
      })
      const l1Submitter = new L1StateSubmitter(
        FLUSH_PERIOD_SEC,
        l1Manager,
        client,
        mempool,
        Logger.SILENT,
      )
      l1Submitter.start()
      await time.tickAsync(FLUSH_PERIOD_SEC * 3000)

      expect(mempool.empty).toHaveBeenCalledTimes(3)
      expect(mempool.getTransactionsInPool).toHaveBeenCalledTimes(3)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        1,
        modelTx1SerializedHex,
      )
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        2,
        modelTx2SerializedHex,
      )
    })

    it('submits transactions every flush period seconds', async () => {
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
      const client = mockObject<EthereumPrivateClient>({
        writeToCTCContract: mockFn()
          .throwsOnce(new Error('failed'))
          .returns(null),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([modelTx1SerializedHex])
          .returnsOnce([modelTx2SerializedHex]),
        empty: mockFn().returns(null),
      })
      const l1Submitter = new L1StateSubmitter(
        FLUSH_PERIOD_SEC,
        l1Manager,
        client,
        mempool,
        Logger.SILENT,
      )
      l1Submitter.start()
      await time.tickAsync(FLUSH_PERIOD_SEC * 3000)

      expect(mempool.empty).toHaveBeenCalledTimes(2)
      expect(mempool.getTransactionsInPool).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        1,
        modelTx1SerializedHex,
      )
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        2,
        modelTx2SerializedHex,
      )
    })
  })
})
