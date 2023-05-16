export interface Hex extends String {
  _Value: string
}

export function Hex(value: bigint | number | string): Hex {
  if (typeof value === 'number') {
    return `0x${value.toString(16)}` as unknown as Hex
  } else if (typeof value === 'bigint') {
    return `0x${value.toString(16)}` as unknown as Hex
  }

  if (value.startsWith('0x')) {
    value = value.slice(2)
  }

  if (/^[0-9a-fA-F]+$/.test(value)) {
    return `0x${value}` as unknown as Hex
  } else {
    throw new Error(
      'Provided string contains characters that are not hexadecimal digits',
    )
  }
}

Hex.toString = function toString(a: Hex): string {
  return a as unknown as string
}
