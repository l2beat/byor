import { Hex } from 'viem'

export interface Unsigned64 extends BigInt {
  _Value: bigint
}

export function Unsigned64(value: bigint | number): Unsigned64 {
  if (typeof value === 'number') {
    value = BigInt(value)
  }

  const MAX_U64 = (1n << 64n) - 1n
  const MIN_U64 = 0n
  if (value >= MIN_U64 && value <= MAX_U64) {
    return value as unknown as Unsigned64
  } else {
    throw new Error('Value not in unsigned 64bit range')
  }
}

Unsigned64.toHex = function toHex(a: Unsigned64): Hex {
  const hexed = a.toString(16)
  return `0x${'0'.repeat(16 - hexed.length)}${hexed}`
}

Unsigned64.fromHex = function fromHex(a: Hex): Unsigned64 {
  return Unsigned64(BigInt(a))
}

Unsigned64.toBigInt = function toBigInt(a: Unsigned64): bigint {
  return a as unknown as bigint
}

export interface Unsigned8 extends BigInt {
  _Value: bigint
}

export function Unsigned8(value: bigint | number): Unsigned8 {
  if (typeof value === 'number') {
    value = BigInt(value)
  }

  const MAX_U8 = (1n << 8n) - 1n
  const MIN_U8 = 0n
  if (value >= MIN_U8 && value <= MAX_U8) {
    return value as unknown as Unsigned8
  } else {
    throw new Error('Value not in unsigned 8bit range')
  }
}

Unsigned8.toHex = function toHex(a: Unsigned8): Hex {
  const hexed = a.toString(16)
  return `0x${'0'.repeat(2 - hexed.length)}${hexed}`
}

Unsigned8.fromHex = function fromHex(a: Hex): Unsigned8 {
  return Unsigned8(BigInt(a))
}
