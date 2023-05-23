import { expect } from 'earl'

import { Hex } from './Hex'

describe('Hex', () => {
  it('transforms number zero', async () => {
    const value = Hex(0)

    expect(value).toEqual('0x0' as unknown as Hex)
  })

  it('transforms random two byte number', async () => {
    const value = Hex(34234)

    expect(value).toEqual('0x85ba' as unknown as Hex)
  })

  it('transforms bigint zero', async () => {
    const value = Hex(0n)

    expect(value).toEqual('0x0' as unknown as Hex)
  })

  it('transforms random eight byte bigint', async () => {
    const value = Hex(9022819797136957440n)

    expect(value).toEqual('0x7d377eccf0b5e000' as unknown as Hex)
  })

  it('transforms a just the prefix to zero', async () => {
    const value = Hex('0x')

    expect(value).toEqual('0x0' as unknown as Hex)
  })

  it('transforms a valid hex string', async () => {
    const value = Hex('0xdeadcafe')

    expect(value).toEqual('0xdeadcafe' as unknown as Hex)
  })

  it('transforms a valid long hex string', async () => {
    const value = Hex('0xdeadcafebabebeefabacadaba0987654321234567890')

    expect(value).toEqual(
      '0xdeadcafebabebeefabacadaba0987654321234567890' as unknown as Hex,
    )
  })

  it('transforms does not remove padding zeroes', async () => {
    const value = Hex('0x0001')

    expect(value).toEqual('0x0001' as unknown as Hex)
  })

  it('throws on invalid string', async () => {
    expect(() => Hex('quick red fox jumped over the lazy dog')).toThrow()
  })

  it('throws on almost-valid string', async () => {
    expect(() =>
      Hex('0xdeadcafebabebeefabacadaba0987foo321234567890'),
    ).toThrow()
  })
})
