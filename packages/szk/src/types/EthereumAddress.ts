import { Hex, isAddress } from 'viem'

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

EthereumAddress.toHex = function toHex(a: EthereumAddress): Hex {
  return a as unknown as Hex
}