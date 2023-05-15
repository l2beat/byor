import { expect } from 'earl'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  deserialize,
  deserializeAndVerify,
  serializeAndSign,
} from './Serialize'
import { EthereumAddress } from './types/EthereumAddress'
import { SIGNED_TX_HEX_SIZE, Transaction } from './types/Transactions'
import { Unsigned64 } from './types/UnsignedSized'

const modelAccount = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

const modelTx: Transaction = {
  from: EthereumAddress(modelAccount.address),
  to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
  value: Unsigned64(10),
  nonce: Unsigned64(1),
  fee: Unsigned64(2),
  hash: '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
}

const modelTxSerializedHex =
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b'

describe('serialize', () => {
  it('serializes a valid transaction', async () => {
    const serialized = await serializeAndSign(modelTx, modelAccount)

    expect(serialized.length).toEqual(SIGNED_TX_HEX_SIZE)
    expect(serialized).toEqual(modelTxSerializedHex)
  })
})

describe('deserialize', () => {
  it('deserializes with error with too small of a input', async () => {
    const signedTxBytes = '0x01'

    await expect(() => deserialize(signedTxBytes)).toBeRejected()
  })

  it('deserializes but result is not equal to the model transaction after message corruption', async () => {
    const signedTxBytes: Hex = `0xdead${modelTxSerializedHex.slice(6)}`

    const tx = await deserialize(signedTxBytes)

    expect(tx).not.toEqual(modelTx)
  })

  it('deserializes but fails verifiction after message corruption', async () => {
    const signedTxBytes: Hex = `0xdead${modelTxSerializedHex.slice(6)}`

    await expect(() =>
      deserializeAndVerify(
        signedTxBytes,
        EthereumAddress(modelAccount.address),
      ),
    ).toBeRejected()
  })

  it('deserializes a valid input', async () => {
    const signedTxBytes = modelTxSerializedHex

    const tx = await deserialize(signedTxBytes)

    expect(tx).toEqual(modelTx)
  })

  it('deserializes a valid input with verification', async () => {
    const signedTxBytes = modelTxSerializedHex

    const tx = await deserializeAndVerify(
      signedTxBytes,
      EthereumAddress(modelAccount.address),
    )

    expect(tx).toEqual(modelTx)
  })
})
