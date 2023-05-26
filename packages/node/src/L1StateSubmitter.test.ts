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

import { L1StateSubmitter } from './L1StateSubmitter'
import { EthereumPrivateClient } from './peripherals/ethereum/EthereumPrivateClient'
import { Mempool } from './peripherals/mempool/Mempool'

describe(L1StateSubmitter.name, () => {
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

  let time: InstalledClock

  before(async () => {
    modelTx1SerializedHex = await serializeAndSign(modelTx1, modelAccount1)
    modelTx2SerializedHex = await serializeAndSign(modelTx2, modelAccount1)
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
      const client = mockObject<EthereumPrivateClient>({
        writeToCTCContract: mockFn().returns(null),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([modelTx1SerializedHex])
          .returnsOnce([modelTx2SerializedHex])
          .returnsOnce([modelTx1SerializedHex, modelTx2SerializedHex]),
        empty: mockFn().returns(null),
      })
      const l1Submitter = new L1StateSubmitter(
        FLUSH_PERIOD_SEC,
        client,
        mempool,
        Logger.SILENT,
      )
      l1Submitter.start()
      time.tick(FLUSH_PERIOD_SEC * 3000)

      expect(mempool.empty).toHaveBeenCalledTimes(3)
      expect(mempool.getTransactionsInPool).toHaveBeenCalledTimes(3)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(3)
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        1,
        modelTx1SerializedHex,
      )
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        2,
        modelTx2SerializedHex,
      )
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        3,
        Hex.concat(modelTx1SerializedHex, modelTx2SerializedHex),
      )
    })

    it('does not submit empty transactions', async () => {
      const client = mockObject<EthereumPrivateClient>({
        writeToCTCContract: mockFn().returns(null),
      })
      const mempool = mockObject<Mempool>({
        getTransactionsInPool: mockFn()
          .returnsOnce([modelTx1SerializedHex])
          .returnsOnce([])
          .returnsOnce([modelTx1SerializedHex, modelTx2SerializedHex]),
        empty: mockFn().returns(null),
      })
      const l1Submitter = new L1StateSubmitter(
        FLUSH_PERIOD_SEC,
        client,
        mempool,
        Logger.SILENT,
      )
      l1Submitter.start()
      time.tick(FLUSH_PERIOD_SEC * 3000)

      expect(mempool.empty).toHaveBeenCalledTimes(3)
      expect(mempool.getTransactionsInPool).toHaveBeenCalledTimes(3)
      expect(client.writeToCTCContract).toHaveBeenCalledTimes(2)
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        1,
        modelTx1SerializedHex,
      )
      expect(client.writeToCTCContract).toHaveBeenNthCalledWith(
        2,
        Hex.concat(modelTx1SerializedHex, modelTx2SerializedHex),
      )
    })
  })
})
