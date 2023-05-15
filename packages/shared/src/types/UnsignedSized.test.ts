import { expect } from 'earl'

import { Unsigned8, Unsigned64 } from './UnsignedSized'

describe('Unsigned64', function () {
  const MAX_U64 = (1n << 64n) - 1n

  it('Should transform number zero', async function () {
    const value = Unsigned64(0)

    expect(value).toEqual(0n as unknown as Unsigned64)
  })

  it('Should transform valid number', async function () {
    const value = Unsigned64(420)

    expect(value).toEqual(420n as unknown as Unsigned64)
  })

  it('Should transform large number', async function () {
    const value = Unsigned64(2251804108652544)

    expect(value).toEqual(2251804108652544n as unknown as Unsigned64)
  })

  it('Should throw for floating point number', async function () {
    expect(() => Unsigned64(3.14159)).toThrow()
  })

  it('Should throw for negative number', async function () {
    expect(() => Unsigned64(-1)).toThrow()
    expect(() => Unsigned64(-3.14159)).toThrow()
  })

  it('Should transform bigint zero', async function () {
    const value = Unsigned64(0n)

    expect(value).toEqual(0n as unknown as Unsigned64)
  })

  it('Should transform valid bigint', async function () {
    const value = Unsigned64(420n)

    expect(value).toEqual(420n as unknown as Unsigned64)
  })

  it('Should transform large bigint', async function () {
    const value = Unsigned64(2251804108652544n)

    expect(value).toEqual(2251804108652544n as unknown as Unsigned64)
  })

  it('Should transform unsigned 64bit limit bigint', async function () {
    const value = Unsigned64(MAX_U64)

    expect(value).toEqual(MAX_U64 as unknown as Unsigned64)
  })

  it('Should throw for negative bigint', async function () {
    expect(() => Unsigned64(-1n)).toThrow()
    expect(() => Unsigned64(-420n)).toThrow()
  })

  it('Should throw for bigint bigger than unsigned 64bit', async function () {
    expect(() => Unsigned64(MAX_U64 + 1n)).toThrow()
  })

  it('Should convert to correct hex with zero padding', async function () {
    expect(Unsigned64.toHex(Unsigned64(0n))).toEqual('0x0000000000000000')
    expect(Unsigned64.toHex(Unsigned64(1n))).toEqual('0x0000000000000001')
    expect(Unsigned64.toHex(Unsigned64(256n))).toEqual('0x0000000000000100')
    expect(Unsigned64.toHex(Unsigned64(2251804108652544n))).toEqual(
      '0x0008000100000000',
    )
    expect(Unsigned64.toHex(Unsigned64(MAX_U64))).toEqual('0xffffffffffffffff')
  })

  it('Should convert from hex', async function () {
    expect(Unsigned64.fromHex('0x0000000000000000')).toEqual(Unsigned64(0n))
    expect(Unsigned64.fromHex('0x0000000000000001')).toEqual(Unsigned64(1n))
    expect(Unsigned64.fromHex('0x0000000000000100')).toEqual(Unsigned64(256n))
    expect(Unsigned64.fromHex('0x0008000100000000')).toEqual(
      Unsigned64(2251804108652544n),
    )
    expect(Unsigned64.fromHex('0xffffffffffffffff')).toEqual(
      Unsigned64(MAX_U64),
    )
  })

  it('Should throw on invalid hex', async function () {
    expect(() => Unsigned64.fromHex('0xloremipsum')).toThrow()
  })
})

describe('Unsigned8', function () {
  const MAX_U8 = (1n << 8n) - 1n

  it('Should transform number zero', async function () {
    const value = Unsigned8(0)

    expect(value).toEqual(0n as unknown as Unsigned8)
  })

  it('Should transform valid number', async function () {
    const value = Unsigned8(69)

    expect(value).toEqual(69n as unknown as Unsigned8)
  })

  it('Should transform large number', async function () {
    const value = Unsigned8(123)

    expect(value).toEqual(123n as unknown as Unsigned8)
  })

  it('Should throw for floating point number', async function () {
    expect(() => Unsigned8(3.14159)).toThrow()
  })

  it('Should throw for negative number', async function () {
    expect(() => Unsigned8(-1)).toThrow()
    expect(() => Unsigned8(-3.14159)).toThrow()
  })

  it('Should transform bigint zero', async function () {
    const value = Unsigned8(0n)

    expect(value).toEqual(0n as unknown as Unsigned8)
  })

  it('Should transform valid bigint', async function () {
    const value = Unsigned8(69n)

    expect(value).toEqual(69n as unknown as Unsigned8)
  })

  it('Should transform large bigint', async function () {
    const value = Unsigned8(123n)

    expect(value).toEqual(123n as unknown as Unsigned8)
  })

  it('Should transform unsigned 8bit limit bigint', async function () {
    const value = Unsigned8(MAX_U8)

    expect(value).toEqual(MAX_U8 as unknown as Unsigned64)
  })

  it('Should throw for negative bigint', async function () {
    expect(() => Unsigned8(-1n)).toThrow()
    expect(() => Unsigned8(-69n)).toThrow()
  })

  it('Should throw for bigint bigger than unsigned 8bit', async function () {
    expect(() => Unsigned8(MAX_U8 + 1n)).toThrow()
  })

  it('Should convert to correct hex with zero padding', async function () {
    expect(Unsigned8.toHex(Unsigned8(0n))).toEqual('0x00')
    expect(Unsigned8.toHex(Unsigned8(1n))).toEqual('0x01')
    expect(Unsigned8.toHex(Unsigned8(123n))).toEqual('0x7b')
    expect(Unsigned8.toHex(Unsigned8(MAX_U8))).toEqual('0xff')
  })

  it('Should convert from hex', async function () {
    expect(Unsigned8.fromHex('0x00')).toEqual(Unsigned8(0n))
    expect(Unsigned8.fromHex('0x01')).toEqual(Unsigned8(1n))
    expect(Unsigned8.fromHex('0x7b')).toEqual(Unsigned8(123n))
    expect(Unsigned8.fromHex('0xff')).toEqual(Unsigned8(MAX_U8))
  })

  it('Should throw on invalid hex', async function () {
    expect(() => Unsigned8.fromHex('0xloremipsum')).toThrow()
  })
})
