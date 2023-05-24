import { EthereumAddress, Hex } from '@byor/shared'

export interface L1EventStateType {
  poster: EthereumAddress
  calldata: Hex
}
