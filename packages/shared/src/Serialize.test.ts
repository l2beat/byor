import { expect } from 'earl'

import {
  deserialize,
  deserializeAndVerify,
  serializeAndSign,
} from './Serialize'
import {
  modelAccount,
  modelTx1,
  modelTxSerializedHex1,
} from './supporting/modelTestConstats'
import { EthereumAddress } from './types/EthereumAddress'
import { Hex } from './types/Hex'
import { SIGNED_TX_HEX_SIZE } from './types/Transactions'

describe('serialize', () => {
  it('serializes a valid transaction', async () => {
    const serialized = await serializeAndSign(modelTx1, modelAccount)

    expect(serialized.length).toEqual(SIGNED_TX_HEX_SIZE)
    expect(serialized).toEqual(modelTxSerializedHex1)
  })
})

describe('deserialize', () => {
  it('deserializes with error with too small of a input', async () => {
    const signedTxBytes = Hex('0x01')

    await expect(() => deserialize(signedTxBytes)).toBeRejectedWith(
      'Invalid input size',
    )
  })

  it('deserializes but result is not equal to the model transaction after message corruption', async () => {
    const signedTxBytes = Hex(
      `0xdead${Hex.toString(modelTxSerializedHex1).slice(6)}`,
    )

    const tx = await deserialize(signedTxBytes)

    expect(tx).not.toEqual(modelTx1)
  })

  it('deserializes but fails verifiction after message corruption', async () => {
    const signedTxBytes = Hex(
      `0xdead${Hex.toString(modelTxSerializedHex1).slice(6)}`,
    )

    await expect(() =>
      deserializeAndVerify(
        signedTxBytes,
        EthereumAddress(modelAccount.address),
      ),
    ).toBeRejectedWith('Recovered address does not match')
  })

  it('deserializes a valid input', async () => {
    const signedTxBytes = modelTxSerializedHex1

    const tx = await deserialize(signedTxBytes)

    expect(tx).toEqual(modelTx1)
  })

  it('deserializes a valid input with verification', async () => {
    const signedTxBytes = modelTxSerializedHex1

    const tx = await deserializeAndVerify(
      signedTxBytes,
      EthereumAddress(modelAccount.address),
    )

    expect(tx).toEqual(modelTx1)
  })
})
