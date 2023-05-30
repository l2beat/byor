import {
  EthereumAddress,
  Hex,
  Logger,
  SignedTransaction,
  Unsigned8,
  Unsigned64,
} from '@byor/shared'
import { expect } from 'earl'
import { privateKeyToAccount } from 'viem/accounts'

import { Mempool } from './Mempool'

describe(Mempool.name, () => {
  const modelAccount = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  )

  const modelSignedTx1: SignedTransaction = {
    from: EthereumAddress(modelAccount.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(10),
    nonce: Unsigned64(1),
    fee: Unsigned64(2),
    hash: Hex(
      '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
    ),
    r: Hex(
      '0x950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f98',
    ),
    s: Hex(
      '0x67d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d033',
    ),
    v: Unsigned8(27),
  }

  const modelSignedTx2: SignedTransaction = {
    from: EthereumAddress(modelAccount.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(10),
    nonce: Unsigned64(1),
    fee: Unsigned64(2),
    hash: Hex(
      '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
    ),
    r: Hex(
      '0x950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f98',
    ),
    s: Hex(
      '0x67d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d033',
    ),
    v: Unsigned8(27),
  }

  describe(Mempool.prototype.add.name, () => {
    it('adds a single byte array', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])

      expect(mempool.getTransactionsInPool()).toEqual([modelSignedTx1])
    })

    it('adds multiple byte arrays', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])
      mempool.add([modelSignedTx2])

      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx2,
      ])
    })
  })

  describe(Mempool.prototype.getTransactionsInPool.name, () => {
    it('returns empty at the start', () => {
      const mempool = new Mempool(Logger.SILENT)

      expect(mempool.getTransactionsInPool()).toEqual([])
    })
  })

  describe(Mempool.prototype.empty.name, () => {
    it('empties all transactions', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])
      mempool.add([modelSignedTx2])
      mempool.empty()

      expect(mempool.getTransactionsInPool()).toEqual([])
    })

    it('does nothing at empty', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.empty()

      expect(mempool.getTransactionsInPool()).toEqual([])
    })
  })
})
