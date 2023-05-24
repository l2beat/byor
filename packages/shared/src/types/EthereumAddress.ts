import { isAddress } from 'viem'

import { Hex } from './Hex'

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

EthereumAddress.check = function check(value: string) {
  try {
    return EthereumAddress(value).toString() === value
  } catch {
    return false
  }
}

EthereumAddress.toHex = function toHex(a: EthereumAddress): Hex {
  return Hex(a as unknown as string)
}
