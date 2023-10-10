import {
  deserialize,
  EthereumAddress,
  Hex,
  serializeAndSign,
  SignedTransaction,
  Transaction,
  Unsigned64,
} from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'
import { install, InstalledClock } from '@sinonjs/fake-timers'
import { expect, mockFn, mockObject } from 'earl'
import { privateKeyToAccount } from 'viem/accounts'

import { EthereumPrivateClient } from '../peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from '../peripherals/mempool/Mempool'
import { BatchPoster } from './BatchPoster'
import { StateUpdater } from './StateUpdater'

describe(BatchPoster.name, () => {
  const modelAccount1 = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
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

  let modelTx1SerializedHex: Hex
  let modelTx2SerializedHex: Hex
  let modelSignedTx1: SignedTransaction
  let modelSignedTx2: SignedTransaction
  let time: InstalledClock

  before(async () => {
    modelTx1SerializedHex = await serializeAndSign(modelTx1, modelAccount1)
    modelTx2SerializedHex = await serializeAndSign(modelTx2, modelAccount1)
    modelSignedTx1 = await deserialize(modelTx1SerializedHex)
    modelSignedTx2 = await deserialize(modelTx2SerializedHex)
  })

  beforeEach(async () => {
    time = install()
  })

  afterEach(() => {
    time.uninstall()
  })

  const FLUSH_PERIOD_MS = 1_000
  const TRANSACTION_LIMIT = 100

  describe(BatchPoster.prototype.start.name, () => {
    it('submits transactions where every one applies every flush period seconds', async () => {
      const stateUpdater = mockObject<StateUpdater>({
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
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(2)
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

    it('submits transactions where only some apply every flush period seconds', async () => {
      const stateUpdater = mockObject<StateUpdater>({
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
              nonce: 4n,
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
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(1)
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        1,
        modelTx1SerializedHex,
      )
    })

    it('submits nothing if all transactions can not be applied', async () => {
      const stateUpdater = mockObject<StateUpdater>({
        getState: mockFn()
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 100n,
              nonce: 2n,
            },
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
              balance: 500n,
              nonce: 0n,
            },
          })
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 88n,
              nonce: 4n,
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
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(0)
    })

    it('does not submit empty transactions', async () => {
      const stateUpdater = mockObject<StateUpdater>({
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
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(3)
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

    it('does not submit transaction if balance is too low', async () => {
      const stateUpdater = mockObject<StateUpdater>({
        getState: mockFn()
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 1n,
              nonce: 0n,
            },
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
              balance: 5n,
              nonce: 0n,
            },
          })
          .returns({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 1n,
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
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(0)
    })

    it('does not submit transaction if balance if nonce is wrong', async () => {
      const stateUpdater = mockObject<StateUpdater>({
        getState: mockFn()
          .returnsOnce({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 1000n,
              nonce: 1000n,
            },
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
              balance: 1000n,
              nonce: 1000n,
            },
          })
          .returns({
            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
              balance: 1000n,
              nonce: 2000n,
            },
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
              balance: 10000n,
              nonce: 2000n,
            },
          }),
      })
      const client = mockObject<EthereumPrivateClient>({
        writeToCTCContract: mockFn().returns(null),
      })
      const mempool = mockObject<Mempool>({
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(0)
    })

    it('submits transactions every flush period seconds', async () => {
      const stateUpdater = mockObject<StateUpdater>({
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
        popNHighestFee: mockFn()
          .returnsOnce([modelSignedTx1])
          .returnsOnce([modelSignedTx2]),
        empty: mockFn().returns(null),
      })
      const batchPoster = new BatchPoster(
        stateUpdater,
        client,
        mempool,
        Logger.SILENT,
        TRANSACTION_LIMIT,
        FLUSH_PERIOD_MS,
      )
      batchPoster.start()
      await time.tickAsync(FLUSH_PERIOD_MS * 3)

      expect(mempool.empty).toHaveBeenCalledTimes(0)
      expect(mempool.popNHighestFee).toHaveBeenCalledTimes(2)
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
