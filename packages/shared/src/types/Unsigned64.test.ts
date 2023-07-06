import { expect } from 'earl'

import { Hex } from './Hex'
import { Unsigned64 } from './Unsigned64'

describe(Unsigned64.name, () => {
  const MAX_U64 = (1n << 64n) - 1n

  it('transforms number zero', async () => {
    const value = Unsigned64(0)
    expect(value.valueOf()).toEqual(0n)
  })

  it('transforms a valid number', async () => {
    const value = Unsigned64(420)
    expect(value.valueOf()).toEqual(420n)
  })

  it('transforms a large number', async () => {
    const value = Unsigned64(2251804108652544)
    expect(value.valueOf()).toEqual(2251804108652544n)
  })

  it('throws for floating point number', async () => {
    expect(() => Unsigned64(3.14159)).toThrow()
  })

  it('throws for negative number', async () => {
    expect(() => Unsigned64(-1)).toThrow()
    expect(() => Unsigned64(-3.14159)).toThrow()
  })

  it('transforms bigint zero', async () => {
    const value = Unsigned64(0n)
    expect(value.valueOf()).toEqual(0n)
  })

  it('transforms a valid bigint', async () => {
    const value = Unsigned64(420n)
    expect(value.valueOf()).toEqual(420n)
  })

  it('transforms a large bigint', async () => {
    const value = Unsigned64(2251804108652544n)
    expect(value.valueOf()).toEqual(2251804108652544n)
  })

  it('transforms unsigned 64bit limit bigint', async () => {
    const value = Unsigned64(MAX_U64)
    expect(value.valueOf()).toEqual(MAX_U64)
  })

  it('throws for negative bigint', async () => {
    expect(() => Unsigned64(-1n)).toThrow()
    expect(() => Unsigned64(-420n)).toThrow()
  })

  it('throws for bigint bigger than unsigned 64bit', async () => {
    expect(() => Unsigned64(MAX_U64 + 1n)).toThrow()
  })

  it('converts to correct hex with zero padding', async () => {
    expect(Unsigned64.toHex(Unsigned64(0n))).toEqual(Hex('0x0000000000000000'))
    expect(Unsigned64.toHex(Unsigned64(1n))).toEqual(Hex('0x0000000000000001'))
    expect(Unsigned64.toHex(Unsigned64(256n))).toEqual(
      Hex('0x0000000000000100'),
    )
    expect(Unsigned64.toHex(Unsigned64(2251804108652544n))).toEqual(
      Hex('0x0008000100000000'),
    )
    expect(Unsigned64.toHex(Unsigned64(MAX_U64))).toEqual(
      Hex('0xffffffffffffffff'),
    )
  })

  it('converts from hex', async () => {
    expect(Unsigned64.fromHex(Hex('0x0000000000000000'))).toEqual(
      Unsigned64(0n),
    )
    expect(Unsigned64.fromHex(Hex('0x0000000000000001'))).toEqual(
      Unsigned64(1n),
    )
    expect(Unsigned64.fromHex(Hex('0x0000000000000100'))).toEqual(
      Unsigned64(256n),
    )
    expect(Unsigned64.fromHex(Hex('0x0008000100000000'))).toEqual(
      Unsigned64(2251804108652544n),
    )
    expect(Unsigned64.fromHex(Hex('0xffffffffffffffff'))).toEqual(
      Unsigned64(MAX_U64),
    )
  })
})
