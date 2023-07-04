import { EthereumAddress } from './EthereumAddress'
import { Hex } from './Hex'
import { Unsigned8, Unsigned64 } from './UnsignedSized'

export interface UnsignedTransaction {
  to: EthereumAddress
  value: Unsigned64
  nonce: Unsigned64
  fee: Unsigned64
}

export interface Transaction extends UnsignedTransaction {
  from: EthereumAddress
  hash?: Hex
}

export interface SignedTransaction extends Transaction {
  r: Hex
  s: Hex
  v: Unsigned8
}

export const SIGNED_TX_SIZE = 20 + 8 + 8 + 8 + 32 + 32 + 1
export const SIGNED_TX_ASCII_SIZE = SIGNED_TX_SIZE * 2
export const SIGNED_TX_HEX_SIZE = SIGNED_TX_ASCII_SIZE + 2
