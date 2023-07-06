import { Hex } from './Hex'

export interface Unsigned8 extends BigInt {
  _Brand: 'Unsigned8'
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

Unsigned8.toHex = function toHex(value: Unsigned8): Hex {
  return Hex(value.toString(16).padStart(2, '0'))
}

Unsigned8.fromHex = function fromHex(value: Hex): Unsigned8 {
  return Unsigned8(BigInt(value.toString()))
}
