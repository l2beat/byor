import { expect } from 'earl'

import {
  deserializeBatch,
  serializeAndSignBatch,
  serializeBatch,
} from './BatchSerialize'
import {
  modelAccount,
  modelSignedTx1,
  modelSignedTx2,
  modelTx1,
  modelTx2,
  modelTxSerializedHex1,
  modelTxSerializedHex2,
} from './test/modelTestConstats'
import { EthereumAddress } from './types'
import { Hex } from './types/Hex'
import { SignedTransaction, Transaction } from './types/Transactions'

describe(serializeBatch.name, () => {
  it('serializes a single valid transaction', async () => {
    const bytes = serializeBatch([modelSignedTx2])

    expect(bytes).toEqual(modelTxSerializedHex2)
  })

  it('serializes two identical valid transactions', async () => {
    const bytes = serializeBatch(
      new Array<SignedTransaction>(2).fill(modelSignedTx1),
    )

    expect(bytes).toEqual(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(2)),
    )
  })

  it('serializes a hundred identical valid transactions', async () => {
    const bytes = serializeBatch(
      new Array<SignedTransaction>(100).fill(modelSignedTx1),
    )

    expect(bytes).toEqual(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(100)),
    )
  })

  it('serializes two different valid transactions', async () => {
    const bytes = serializeBatch([modelSignedTx1, modelSignedTx2])

    expect(bytes).toEqual(
      Hex(
        `${Hex.removePrefix(modelTxSerializedHex1)}${Hex.removePrefix(
          modelTxSerializedHex2,
        )}`,
      ),
    )
  })
})

describe(serializeAndSignBatch.name, () => {
  it('serializes a single valid transaction', async () => {
    const bytes = await serializeAndSignBatch([modelTx1], modelAccount)

    expect(bytes).toEqual(modelTxSerializedHex1)
  })

  it('serializes two identical valid transactions', async () => {
    const bytes = await serializeAndSignBatch(
      new Array<Transaction>(2).fill(modelTx1),
      modelAccount,
    )

    expect(bytes).toEqual(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(2)),
    )
  })

  it('serializes a hundred identical valid transactions', async () => {
    const bytes = await serializeAndSignBatch(
      new Array<Transaction>(100).fill(modelTx1),
      modelAccount,
    )

    expect(bytes).toEqual(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(100)),
    )
  })

  it('serializes two different valid transactions', async () => {
    const bytes = await serializeAndSignBatch(
      [modelTx1, modelTx2],
      modelAccount,
    )

    expect(bytes).toEqual(
      Hex(
        `${Hex.removePrefix(modelTxSerializedHex1)}${Hex.removePrefix(
          modelTxSerializedHex2,
        )}`,
      ),
    )
  })
})

describe('deserializeBatch', () => {
  it('deserializes a single valid transaction', async () => {
    const batch = await deserializeBatch(modelTxSerializedHex1)

    expect(batch.length).toEqual(1)
    expect(batch).toEqual([modelSignedTx1])
  })

  it('deserializes two identical valid transactions', async () => {
    const batch = await deserializeBatch(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(2)),
    )

    expect(batch.length).toEqual(2)
    expect(batch).toEqual([modelSignedTx1, modelSignedTx1])
  })

  it('deserializes a hundred identical valid transactions', async () => {
    const batch = await deserializeBatch(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(100)),
    )

    expect(batch.length).toEqual(100)
    expect(batch).toEqual(Array<SignedTransaction>(100).fill(modelSignedTx1))
  })

  it('deserializes two different valid transactions', async () => {
    const secondTx = { ...modelSignedTx1 }
    secondTx.to = EthereumAddress('0xcafe7970C51812dc3A010C7d01b50e0d17dc79C8')
    secondTx.from = EthereumAddress(
      '0xdd7e904328072ca5BcB41aE72754766b4BFEA0E4',
    )
    secondTx.hash = Hex(
      '0x73aed7675fdaf8f56467fe08bf74ab48a4fd8dd587f8bafa97c06bbb400f70f8',
    )
    const firstTxBytes = Hex.removePrefix(modelTxSerializedHex1)
    const secondTxBytes = `cafe${Hex.removePrefix(modelTxSerializedHex1).slice(
      4,
    )}`

    const batch = await deserializeBatch(Hex(`${firstTxBytes}${secondTxBytes}`))

    expect(batch.length).toEqual(2)
    expect(batch).toEqual([modelSignedTx1, secondTx])
  })

  it('throws on smaller than a single transaction', async () => {
    await expect(() =>
      deserializeBatch(Hex('0x707070707070')),
    ).toBeRejectedWith('input bytes is not multiple')
  })

  it('throws on not a multiplicitive of a single transaction', async () => {
    const bytes = Hex(`${Hex.removePrefix(modelTxSerializedHex1)}abacadaba`)

    await expect(() => deserializeBatch(bytes)).toBeRejectedWith(
      'input bytes is not multiple',
    )
  })
})
