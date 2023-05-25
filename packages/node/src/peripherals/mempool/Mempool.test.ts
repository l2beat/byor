import { Hex, Logger } from '@byor/shared'
import { expect } from 'earl'

import { Mempool } from './Mempool'

describe(Mempool.name, () => {
  describe(Mempool.prototype.add.name, () => {
    it('adds a single byte array', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add(Hex('0x123456'))

      expect(mempool.getTransactionsInPool()).toEqual([Hex('0x123456')])
    })

    it('adds multiple bytes arrays', () => {
      const mempool = new Mempool(Logger.SILENT)

      mempool.add(Hex('0x123456'))
      mempool.add(Hex('0xaabbcc'))
      mempool.add(Hex('0xddeeff'))

      expect(mempool.getTransactionsInPool()).toEqual([
        Hex('0x123456'),
        Hex('0xaabbcc'),
        Hex('0xddeeff'),
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

      mempool.add(Hex('0x123456'))
      mempool.add(Hex('0xaabbcc'))
      mempool.add(Hex('0xddeeff'))
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
