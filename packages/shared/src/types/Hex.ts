export interface Hex extends String {
  _Brand: 'Hex'
  toString(): `0x${string}`
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function Hex(value: bigint | number | string | String): Hex {
  if (typeof value === 'number') {
    return `0x${value.toString(16)}` as unknown as Hex
  } else if (typeof value === 'bigint') {
    return `0x${value.toString(16)}` as unknown as Hex
  }
  return normalizeHex(value.toString()) as unknown as Hex
}

function normalizeHex(value: string): string {
  if (!value.startsWith('0x')) {
    value = '0x' + value
  }
  if (value === '0x') {
    value = '0x0'
  }
  if (/^0x[0-9a-fA-F]+$/.test(value)) {
    return value
  } else {
    throw new Error(
      'Provided string contains characters that are not hexadecimal digits',
    )
  }
}

Hex.slice = function slice(a: Hex, start: number, end?: number): Hex {
  const sliced = a.slice(
    2 + start * 2,
    end !== undefined ? 2 + end * 2 : undefined,
  )
  return ('0x' + sliced) as unknown as Hex
}

Hex.concat = function concat(...items: (Hex | string)[]): Hex {
  return ('0x' + items.map((x) => Hex(x).slice(2)).join('')) as unknown as Hex
}

Hex.removePrefix = function removePrefix(a: Hex): string {
  return (a as unknown as string).slice(2)
}

Hex.getLength = function getLength(a: Hex): number {
  return a.length / 2 - 1
}
