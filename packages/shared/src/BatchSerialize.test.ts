import { expect } from 'earl'

import { deserializeBatch, serializeAndSignBatch } from './BatchSerialize'
import {
  modelAccount,
  modelTx1,
  modelTx2,
  modelTxSerializedHex1,
  modelTxSerializedHex2,
} from './test/modelTestConstats'
import { EthereumAddress } from './types'
import { Hex } from './types/Hex'
import { Transaction } from './types/Transactions'

describe('serializeBatch', () => {
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
    expect(batch).toEqual([modelTx1])
  })

  it('deserializes two identical valid transactions', async () => {
    const batch = await deserializeBatch(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(2)),
    )

    expect(batch.length).toEqual(2)
    expect(batch).toEqual([modelTx1, modelTx1])
  })

  it('deserializes a hundred identical valid transactions', async () => {
    const batch = await deserializeBatch(
      Hex(Hex.removePrefix(modelTxSerializedHex1).repeat(100)),
    )

    expect(batch.length).toEqual(100)
    expect(batch).toEqual(Array<Transaction>(100).fill(modelTx1))
  })

  it('deserializes two different valid transactions', async () => {
    const secondTx = { ...modelTx1 }
    secondTx.to = EthereumAddress('0xcafe7970C51812dc3A010C7d01b50e0d17dc79C8')
    secondTx.from = Hex('0x491E388D88a808b9cA6547a7507daf29D4954BF7')
    secondTx.hash = Hex(
      '0x6acf80d210e85589d2fe24764e04ef379596d994cac505dab44ac0b2451fe88a',
    )
    const firstTxBytes = Hex.removePrefix(modelTxSerializedHex1)
    const secondTxBytes = `cafe${Hex.removePrefix(modelTxSerializedHex1).slice(
      4,
    )}`

    const batch = await deserializeBatch(Hex(`${firstTxBytes}${secondTxBytes}`))

    expect(batch.length).toEqual(2)
    expect(batch).toEqual([modelTx1, secondTx])
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
