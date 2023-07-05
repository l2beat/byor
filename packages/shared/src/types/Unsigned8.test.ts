import { expect } from 'earl'

import { Hex } from './Hex'
import { Unsigned8 } from './Unsigned8'

describe(Unsigned8.name, () => {
  const MAX_U8 = (1n << 8n) - 1n

  it('transforms number zero', async () => {
    const value = Unsigned8(0)
    expect(value.valueOf()).toEqual(0n)
  })

  it('transforms a valid number', async () => {
    const value = Unsigned8(69)
    expect(value.valueOf()).toEqual(69n)
  })

  it('transforms a large number', async () => {
    const value = Unsigned8(123)
    expect(value.valueOf()).toEqual(123n)
  })

  it('throws for floating point number', async () => {
    expect(() => Unsigned8(3.14159)).toThrow()
  })

  it('throws for negative number', async () => {
    expect(() => Unsigned8(-1)).toThrow()
    expect(() => Unsigned8(-3.14159)).toThrow()
  })

  it('transforms bigint zero', async () => {
    const value = Unsigned8(0n)
    expect(value.valueOf()).toEqual(0n)
  })

  it('transforms a valid bigint', async () => {
    const value = Unsigned8(69n)
    expect(value.valueOf()).toEqual(69n)
  })

  it('transforms a large bigint', async () => {
    const value = Unsigned8(123n)
    expect(value.valueOf()).toEqual(123n)
  })

  it('transforms unsigned 8bit limit bigint', async () => {
    const value = Unsigned8(MAX_U8)
    expect(value.valueOf()).toEqual(MAX_U8)
  })

  it('throws for negative bigint', async () => {
    expect(() => Unsigned8(-1n)).toThrow()
    expect(() => Unsigned8(-69n)).toThrow()
  })

  it('throws for bigint bigger than unsigned 8bit', async () => {
    expect(() => Unsigned8(MAX_U8 + 1n)).toThrow()
  })

  it('converts to correct hex with zero padding', async () => {
    expect(Unsigned8.toHex(Unsigned8(0n))).toEqual(Hex('0x00'))
    expect(Unsigned8.toHex(Unsigned8(1n))).toEqual(Hex('0x01'))
    expect(Unsigned8.toHex(Unsigned8(123n))).toEqual(Hex('0x7b'))
    expect(Unsigned8.toHex(Unsigned8(MAX_U8))).toEqual(Hex('0xff'))
  })

  it('converts from hex', async () => {
    expect(Unsigned8.fromHex(Hex('0x00'))).toEqual(Unsigned8(0n))
    expect(Unsigned8.fromHex(Hex('0x01'))).toEqual(Unsigned8(1n))
    expect(Unsigned8.fromHex(Hex('0x7b'))).toEqual(Unsigned8(123n))
    expect(Unsigned8.fromHex(Hex('0xff'))).toEqual(Unsigned8(MAX_U8))
  })
})
