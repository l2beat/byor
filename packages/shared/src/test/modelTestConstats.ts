import { privateKeyToAccount } from 'viem/accounts'

import { EthereumAddress } from '../types/EthereumAddress'
import { Hex } from '../types/Hex'
import { SignedTransaction, Transaction } from '../types/Transactions'
import { Unsigned8 } from '../types/Unsigned8'
import { Unsigned64 } from '../types/Unsigned64'

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
    '0x413f5fcfd6c28cfa6d533a9f5e583e28b21dd13f3ae664e2743b65ed5b055f44',
  ),
  r: Hex('0x5d25f7fc2979bf5d5f9968106d49ec24cb1d1627c9a123c81061ebcc16feaffd'),
  s: Hex('0x326d615c7393c19b992d7526471e9140136dbded0c2ca7efa391c6d9bcdf64aa'),
  v: Unsigned8(28),
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
    '0x413f5fcfd6c28cfa6d533a9f5e583e28b21dd13f3ae664e2743b65ed5b055f44',
  ),
  r: Hex('0xd376ed2255d964a811dde23f2f9ca229db6e1eb5d75a7cade92e4f400fd86763'),
  s: Hex('0x2c2683c8274a5d54c8fcc1881323e73f046d0eb69900a9ff3c7f772dc84c7f73'),
  v: Unsigned8(27),
}

export const modelTxSerializedHex1 = Hex(
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a000000000000000100000000000000025d25f7fc2979bf5d5f9968106d49ec24cb1d1627c9a123c81061ebcc16feaffd326d615c7393c19b992d7526471e9140136dbded0c2ca7efa391c6d9bcdf64aa1c',
)

export const modelTxSerializedHex2 = Hex(
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC000000000f6809090000000005c90aab0000000008f66346d376ed2255d964a811dde23f2f9ca229db6e1eb5d75a7cade92e4f400fd867632c2683c8274a5d54c8fcc1881323e73f046d0eb69900a9ff3c7f772dc84c7f731b',
)
