import { expect } from 'earl'
import * as E from 'fp-ts/Either'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  DeserializationError,
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

describe('serialize', function () {
  it('Should serialize a valid transaction', async function () {
    const serialized = await serializeAndSign(modelTx, modelAccount)

    expect(serialized.length).toEqual(SIGNED_TX_HEX_SIZE)
    expect(serialized).toEqual(modelTxSerializedHex)
  })
})

describe('deserialize', function () {
  it('Should error on deserialize with too small of a input', async function () {
    const signedTxBytes = '0x01'

    const deserialized = await deserialize(signedTxBytes)

    expect(E.isRight(deserialized)).toBeTruthy()
    expect(deserialized.right).toEqual(DeserializationError.INVALID_INPUT_SIZE)
  })

  it('Should deserialize but not be equal to the model transaction after message corruption', async function () {
    const signedTxBytes: Hex = `0xdead${modelTxSerializedHex.slice(6)}`

    const deserialized = await deserialize(signedTxBytes)

    expect(E.isLeft(deserialized)).toBeTruthy()
    const tx: Transaction = deserialized.left
    expect(tx).not.toEqual(modelTx)
  })

  it('Should deserialize but fail verifiction after message corruption', async function () {
    const signedTxBytes: Hex = `0xdead${modelTxSerializedHex.slice(6)}`

    const deserialized = await deserializeAndVerify(
      signedTxBytes,
      EthereumAddress(modelAccount.address),
    )

    expect(E.isRight(deserialized)).toBeTruthy()
    expect(deserialized.right).toEqual(
      DeserializationError.SIGNER_VERIFICATION_FAILED,
    )
  })

  it('Should deserialize a valid input', async function () {
    const signedTxBytes = modelTxSerializedHex

    const deserialized = await deserialize(signedTxBytes)

    expect(E.isLeft(deserialized)).toBeTruthy()
    expect(deserialized.left).toEqual(modelTx)
  })

  it('Should deserialize a valid input with verification', async function () {
    const signedTxBytes = modelTxSerializedHex

    const deserialized = await deserializeAndVerify(
      signedTxBytes,
      EthereumAddress(modelAccount.address),
    )

    expect(E.isLeft(deserialized)).toBeTruthy()
    expect(deserialized.left).toEqual(modelTx)
  })
})
