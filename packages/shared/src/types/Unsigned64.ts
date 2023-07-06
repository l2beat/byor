import { Hex } from './Hex'

export interface Unsigned64 extends BigInt {
  _Brand: 'Unsigned64'
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

Unsigned64.toHex = function toHex(value: Unsigned64): Hex {
  return Hex(value.toString(16).padStart(16, '0'))
}

Unsigned64.fromHex = function fromHex(value: Hex): Unsigned64 {
  return Unsigned64(BigInt(value.toString()))
}
