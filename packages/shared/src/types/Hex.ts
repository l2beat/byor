export interface Hex extends String {
  _Brand: 'Hex'
  toString(): `0x${string}`
}

export function Hex(value: bigint | number | string): Hex {
  if (typeof value === 'number') {
    return `0x${value.toString(16)}` as unknown as Hex
  } else if (typeof value === 'bigint') {
    return `0x${value.toString(16)}` as unknown as Hex
  }

  value = value.toString()
  if (value.startsWith('0x')) {
    value = value.slice(2)
  }

  if (value === '') {
    value = '0'
  }

  if (/^[0-9a-fA-F]+$/.test(value)) {
    return `0x${value}` as unknown as Hex
  } else {
    throw new Error(
      'Provided string contains characters that are not hexadecimal digits',
    )
  }
}

Hex.concat = function concat(a: Hex, b: Hex): Hex {
  return Hex(Hex.removePrefix(a) + Hex.removePrefix(b))
}

Hex.removePrefix = function removePrefix(a: Hex): string {
  return (a as unknown as string).slice(2)
}
