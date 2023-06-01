import { getAddress, isAddress } from 'viem'

import { Hex } from './Hex'

export interface EthereumAddress extends String {
  _Value: string
}
export function EthereumAddress(value: string): EthereumAddress {
  if (isAddress(value)) {
    return getAddress(value) as unknown as EthereumAddress
  } else {
    throw new Error(`Invalid Ethereum address ${value}`)
  }
}

EthereumAddress.ZERO = EthereumAddress(
  '0x0000000000000000000000000000000000000000',
)

EthereumAddress.toHex = function toHex(a: EthereumAddress): Hex {
  return Hex(a as unknown as string)
}

EthereumAddress.ZERO = EthereumAddress(
  '0x0000000000000000000000000000000000000000',
)
