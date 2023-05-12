import { isAddress } from 'viem'

export interface EthereumAddress extends String {
  _Value: string
}
export function EthereumAddress(value: string): EthereumAddress {
  if (isAddress(value)) {
    return value as unknown as EthereumAddress
  } else {
    throw new Error(`Invalid Ethereum address ${value}`)
  }
}

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

export interface Unsigned8 extends BigInt {
  _Value: bigint
}
export function Unsigned8(value: bigint | number): Unsigned8 {
  if (typeof value === 'number') {
      value = BigInt(value)
  }

  const MAX_U8 = 1n << 8n
  const MIN_U8 = 0n
  if (value >= MIN_U8 && value <= MAX_U8) {
    return value as unknown as Unsigned8
  } else {
    throw new Error('Value not in unsigned 8bit range')
  }
}

export type ByteArray = Uint8Array
export type Hex = `0x${string}`

export interface UnsignedTransaction {
  to: EthereumAddress
  value: Unsigned64
  nonce: Unsigned64
  fee: Unsigned64
}

export interface SignedTransaction extends UnsignedTransaction {
  r: ByteArray
  s: ByteArray
  v: Unsigned8
  hash: ByteArray
}

export interface Transaction extends UnsignedTransaction {
  from: EthereumAddress
  hash: ByteArray
}

export const SIGNED_TX_SIZE: number = 20 + 8 + 8 + 8 + 32 + 32 + 1 + 32
export const SIGNED_TX_HEX_SIZE: number = SIGNED_TX_SIZE * 2 + 2
