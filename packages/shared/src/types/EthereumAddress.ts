import { getAddress } from 'viem'

import { Hex } from './Hex'

export interface EthereumAddress extends String {
  _Brand: 'EthereumAddress'
  toString(): `0x${string}`
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EthereumAddress(value: string | String): EthereumAddress {
  return getAddress(value.toString()) as unknown as EthereumAddress
}

EthereumAddress.toHex = function toHex(a: EthereumAddress): Hex {
  return Hex(a as unknown as string)
}

EthereumAddress.ZERO = EthereumAddress(
  '0x0000000000000000000000000000000000000000',
)
