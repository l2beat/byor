import { EthereumAddress } from './EthereumAddress'
import { Unsigned8,Unsigned64 } from './UnsignedSized'

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

export const SIGNED_TX_SIZE: number = 20 + 8 + 8 + 8 + 32 + 32 + 1
export const SIGNED_TX_HEX_SIZE: number = SIGNED_TX_SIZE * 2 + 2
