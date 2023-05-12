import { assert, expect } from 'chai'

import { Unsigned8,Unsigned64 } from './UnsignedSized'

describe('Unsigned64', function () {
  const MAX_U64 = (1n << 64n) - 1n

  it('Should transform number zero', async function () {
    const value: Unsigned64 = Unsigned64(0)
    expect(value).to.equal(0n)
  })

  it('Should transform valid number', async function () {
    const value: Unsigned64 = Unsigned64(420)
    expect(value).to.equal(420n)
  })

  it('Should transform large number', async function () {
    const value: Unsigned64 = Unsigned64(2251804108652544)
    expect(value).to.equal(2251804108652544n)
  })

  it('Should throw for floating point number', async function () {
    assert.throws(() => Unsigned64(3.14159))
  })

  it('Should throw for negative number', async function () {
    assert.throws(() => Unsigned64(-1))
    assert.throws(() => Unsigned64(-3.14159))
  })

  it('Should transform bigint zero', async function () {
    const value: Unsigned64 = Unsigned64(0n)
    expect(value).to.equal(0n)
  })

  it('Should transform valid bigint', async function () {
    const value: Unsigned64 = Unsigned64(420n)
    expect(value).to.equal(420n)
  })

  it('Should transform large bigint', async function () {
    const value: Unsigned64 = Unsigned64(2251804108652544n)
    expect(value).to.equal(2251804108652544n)
  })

  it('Should transform unsigned 64bit limit bigint', async function () {
    const value: Unsigned64 = Unsigned64(MAX_U64)
    expect(value).to.equal(MAX_U64)
  })

  it('Should throw for negative bigint', async function () {
    assert.throws(() => Unsigned64(-1n))
    assert.throws(() => Unsigned64(-420n))
  })

  it('Should throw for bigint bigger than unsigned 64bit', async function () {
    assert.throws(() => Unsigned64(MAX_U64 + 1n))
  })

  it('Should convert to correct hex with zero padding', async function () {
    expect(Unsigned64.toHex(Unsigned64(0n))).to.equal('0x0000000000000000')
    expect(Unsigned64.toHex(Unsigned64(1n))).to.equal('0x0000000000000001')
    expect(Unsigned64.toHex(Unsigned64(256n))).to.equal('0x0000000000000100')
    expect(Unsigned64.toHex(Unsigned64(2251804108652544n))).to.equal(
      '0x0008000100000000',
    )
    expect(Unsigned64.toHex(Unsigned64(MAX_U64))).to.equal('0xffffffffffffffff')
  })

  it('Should convert from hex', async function () {
    expect(Unsigned64.fromHex('0x0000000000000000')).to.equal(Unsigned64(0n))
    expect(Unsigned64.fromHex('0x0000000000000001')).to.equal(Unsigned64(1n))
    expect(Unsigned64.fromHex('0x0000000000000100')).to.equal(Unsigned64(256n))
    expect(Unsigned64.fromHex('0x0008000100000000')).to.equal(
      Unsigned64(2251804108652544n),
    )
    expect(Unsigned64.fromHex('0xffffffffffffffff')).to.equal(
      Unsigned64(MAX_U64),
    )
  })

  it('Should throw on invalid hex', async function () {
      assert.throws(() => Unsigned64.fromHex('0xloremipsum'))
  })
})

describe('Unsigned8', function () {
  const MAX_U8 = (1n << 8n) - 1n

  it('Should transform number zero', async function () {
    const value: Unsigned8 = Unsigned8(0)
    expect(value).to.equal(0n)
  })

  it('Should transform valid number', async function () {
    const value: Unsigned8 = Unsigned8(69)
    expect(value).to.equal(69n)
  })

  it('Should transform large number', async function () {
    const value: Unsigned8 = Unsigned8(123)
    expect(value).to.equal(123n)
  })

  it('Should throw for floating point number', async function () {
    assert.throws(() => Unsigned8(3.14159))
  })

  it('Should throw for negative number', async function () {
    assert.throws(() => Unsigned8(-1))
    assert.throws(() => Unsigned8(-3.14159))
  })

  it('Should transform bigint zero', async function () {
    const value: Unsigned8 = Unsigned8(0n)
    expect(value).to.equal(0n)
  })

  it('Should transform valid bigint', async function () {
    const value: Unsigned8 = Unsigned8(69n)
    expect(value).to.equal(69n)
  })

  it('Should transform large bigint', async function () {
    const value: Unsigned8 = Unsigned8(123n)
    expect(value).to.equal(123n)
  })

  it('Should transform unsigned 8bit limit bigint', async function () {
    const value: Unsigned8 = Unsigned8(MAX_U8)
    expect(value).to.equal(MAX_U8)
  })

  it('Should throw for negative bigint', async function () {
    assert.throws(() => Unsigned8(-1n))
    assert.throws(() => Unsigned8(-69n))
  })

  it('Should throw for bigint bigger than unsigned 8bit', async function () {
    assert.throws(() => Unsigned8(MAX_U8 + 1n))
  })

  it('Should convert to correct hex with zero padding', async function () {
    expect(Unsigned8.toHex(Unsigned8(0n))).to.equal('0x00')
    expect(Unsigned8.toHex(Unsigned8(1n))).to.equal('0x01')
    expect(Unsigned8.toHex(Unsigned8(123n))).to.equal('0x7b')
    expect(Unsigned8.toHex(Unsigned8(MAX_U8))).to.equal('0xff')
  })

  it('Should convert from hex', async function () {
    expect(Unsigned8.fromHex('0x00')).to.equal(Unsigned8(0n))
    expect(Unsigned8.fromHex('0x01')).to.equal(Unsigned8(1n))
    expect(Unsigned8.fromHex('0x7b')).to.equal(Unsigned8(123n))
    expect(Unsigned8.fromHex('0xff')).to.equal(Unsigned8(MAX_U8))
  })

  it('Should throw on invalid hex', async function () {
      assert.throws(() => Unsigned8.fromHex('0xloremipsum'))
  })
})
