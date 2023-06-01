import { privateKeyToAccount } from 'viem/accounts'

import { EthereumAddress } from '../types/EthereumAddress'
import { Hex } from '../types/Hex'
import { SignedTransaction, Transaction } from '../types/Transactions'
import { Unsigned8, Unsigned64 } from '../types/UnsignedSized'

export const modelAccount = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

//
// Both of those transactions are signed with the same account - `modelAccount`
//
export const modelTx1: Transaction = {
  from: EthereumAddress(modelAccount.address),
  to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
  value: Unsigned64(10),
  nonce: Unsigned64(1),
  fee: Unsigned64(2),
  hash: Hex(
    '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
  ),
}

export const modelSignedTx1: SignedTransaction = {
  from: EthereumAddress(modelAccount.address),
  to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
  value: Unsigned64(10),
  nonce: Unsigned64(1),
  fee: Unsigned64(2),
  hash: Hex(
    '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
  ),
  r: Hex('0x950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f98'),
  s: Hex('0x67d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d033'),
  v: Unsigned8(27),
}

export const modelTx2: Transaction = {
  from: EthereumAddress(modelAccount.address),
  to: EthereumAddress('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
  value: Unsigned64(258476297),
  nonce: Unsigned64(97061547),
  fee: Unsigned64(150364998),
  hash: Hex('0x0'),
}

export const modelSignedTx2: SignedTransaction = {
  from: EthereumAddress(modelAccount.address),
  to: EthereumAddress('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
  value: Unsigned64(258476297),
  nonce: Unsigned64(97061547),
  fee: Unsigned64(150364998),
  hash: Hex(
    '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
  ),
  r: Hex('0x07dccbff6670601b0c34840bcd22a125add807855774225795843f3e5ebff694'),
  s: Hex('0x6776907ea9f0154719515a5460650d5b002f7990e9c995bfbff67e89ce059050'),
  v: Unsigned8(27),
}

export const modelTxSerializedHex1 = Hex(
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b',
)

export const modelTxSerializedHex2 = Hex(
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC000000000f6809090000000005c90aab0000000008f6634607dccbff6670601b0c34840bcd22a125add807855774225795843f3e5ebff6946776907ea9f0154719515a5460650d5b002f7990e9c995bfbff67e89ce0590501b',
)
