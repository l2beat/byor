import {
  EthereumAddress,
  Hex,
  SignedTransaction,
  Unsigned8,
  Unsigned64,
} from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'
import { install, InstalledClock } from '@sinonjs/fake-timers'
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
    fee: Unsigned64(3),
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

  const modelSignedTx3: SignedTransaction = {
    from: EthereumAddress(modelAccount.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(20),
    nonce: Unsigned64(1),
    fee: Unsigned64(3),
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

  const modelSignedTx4: SignedTransaction = {
    from: EthereumAddress(modelAccount.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(30),
    nonce: Unsigned64(1),
    fee: Unsigned64(3),
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

  let time: InstalledClock

  beforeEach(async () => {
    time = install()
  })

  afterEach(() => {
    time.uninstall()
  })

  describe(Mempool.prototype.add.name, () => {
    it('adds a single byte array and records their timestamp', () => {
      time.setSystemTime(31415926)
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])

      expect(mempool.getTransactionsInPool()).toEqual([modelSignedTx1])
      expect(mempool.getTransactionsTimestamps()).toEqual([31415926])
    })

    it('adds multiple byte arrays and records thier timestamp', () => {
      time.setSystemTime(271831415926)
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])
      mempool.add([modelSignedTx2])

      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx2,
      ])
      expect(mempool.getTransactionsTimestamps()).toEqual([
        271831415926, 271831415926,
      ])
    })
  })

  describe(Mempool.prototype.popNHighestFee.name, () => {
    it('intermixes transactions with different fees (n = 3)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx2, modelSignedTx2])

      expect(mempool.popNHighestFee(3)).toEqual([
        modelSignedTx2,
        modelSignedTx2,
        modelSignedTx1,
      ])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes transactions with different fees (n = 1) three times', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx2, modelSignedTx2])

      expect(mempool.popNHighestFee(1)).toEqual([modelSignedTx2])
      expect(mempool.popNHighestFee(1)).toEqual([modelSignedTx2])
      expect(mempool.popNHighestFee(1)).toEqual([modelSignedTx1])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes transactions with different fees (n = 2)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx2, modelSignedTx2])

      expect(mempool.popNHighestFee(2)).toEqual([
        modelSignedTx2,
        modelSignedTx2,
      ])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes transactions with different fees (n = 1)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx2])

      expect(mempool.popNHighestFee(1)).toEqual([modelSignedTx2])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('returns empty at the start', () => {
      const mempool = new Mempool(Logger.SILENT)

      expect(mempool.popNHighestFee(0)).toEqual([])
    })
  })

  describe(Mempool.prototype.popNHighestValue.name, () => {
    it('intermixes transactions with different values (n = 3)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])
      mempool.add([modelSignedTx4])

      expect(mempool.popNHighestValue(3)).toEqual([
        modelSignedTx4,
        modelSignedTx3,
        modelSignedTx3,
      ])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes transactions with different values (n = 1) three times', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])

      expect(mempool.popNHighestValue(1)).toEqual([modelSignedTx3])
      expect(mempool.popNHighestValue(1)).toEqual([modelSignedTx3])
      expect(mempool.popNHighestValue(1)).toEqual([modelSignedTx1])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes transactions with different values (n = 2)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])

      expect(mempool.popNHighestValue(2)).toEqual([
        modelSignedTx3,
        modelSignedTx3,
      ])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes transactions with different values (n = 1)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3])

      expect(mempool.popNHighestValue(1)).toEqual([modelSignedTx3])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('returns empty at the start', () => {
      const mempool = new Mempool(Logger.SILENT)

      expect(mempool.popNHighestValue(0)).toEqual([])
    })
  })

  describe(Mempool.prototype.popNFIFO.name, () => {
    it('intermixes different transactions (n = 3)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])
      mempool.add([modelSignedTx4])

      expect(mempool.popNFIFO(3)).toEqual([
        modelSignedTx1,
        modelSignedTx1,
        modelSignedTx3,
      ])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx3,
        modelSignedTx4,
      ])
    })

    it('intermixes different transactions (n = 1) three times', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])

      expect(mempool.popNFIFO(1)).toEqual([modelSignedTx1])
      expect(mempool.popNFIFO(1)).toEqual([modelSignedTx1])
      expect(mempool.popNFIFO(1)).toEqual([modelSignedTx1])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx3,
        modelSignedTx3,
      ])
    })

    it('intermixes different transactions (n = 2)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])

      expect(mempool.popNFIFO(2)).toEqual([modelSignedTx1, modelSignedTx1])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx3,
        modelSignedTx3,
      ])
    })

    it('intermixes different transactions (n = 1)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3])

      expect(mempool.popNFIFO(1)).toEqual([modelSignedTx1])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx3,
      ])
    })

    it('returns empty at the start', () => {
      const mempool = new Mempool(Logger.SILENT)

      expect(mempool.popNFIFO(0)).toEqual([])
    })
  })

  describe(Mempool.prototype.popNLIFO.name, () => {
    it('intermixes different transactions (n = 3)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])
      mempool.add([modelSignedTx4])

      expect(mempool.popNLIFO(3)).toEqual([
        modelSignedTx4,
        modelSignedTx3,
        modelSignedTx3,
      ])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes different transactions (n = 1) three times', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])

      expect(mempool.popNLIFO(1)).toEqual([modelSignedTx3])
      expect(mempool.popNLIFO(1)).toEqual([modelSignedTx3])
      expect(mempool.popNLIFO(1)).toEqual([modelSignedTx1])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes different transactions (n = 2)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3, modelSignedTx3])

      expect(mempool.popNLIFO(2)).toEqual([modelSignedTx3, modelSignedTx3])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('intermixes different transactions (n = 1)', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1, modelSignedTx1])
      mempool.add([modelSignedTx3])

      expect(mempool.popNLIFO(1)).toEqual([modelSignedTx3])
      expect(mempool.getTransactionsInPool()).toEqual([
        modelSignedTx1,
        modelSignedTx1,
      ])
    })

    it('returns empty at the start', () => {
      const mempool = new Mempool(Logger.SILENT)

      expect(mempool.popNLIFO(0)).toEqual([])
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

  describe(Mempool.prototype.getByHash.name, () => {
    it('returns transaction that is in the mempool', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])

      expect(
        mempool.getByHash(
          Hex(
            '0x413f5fcfd6c28cfa6d533a9f5e583e28b21dd13f3ae664e2743b65ed5b055f44',
          ),
        ),
      ).toEqual(modelSignedTx1)
    })

    it('returns undefined on non-existing with transactions in pool', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add([modelSignedTx1])

      expect(
        mempool.getByHash(
          Hex(
            '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
          ),
        ),
      ).toEqual(undefined)
    })

    it('returns undefined on nothing', () => {
      const mempool = new Mempool(Logger.SILENT)

      expect(
        mempool.getByHash(
          Hex(
            '0xf87a5d255ed56593f5ba3b626c3d3910cd06f6c9a36c718a6781b12b8d3abe17',
          ),
        ),
      ).toEqual(undefined)
    })
  })
})
