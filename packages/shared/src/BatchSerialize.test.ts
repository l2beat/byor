import { expect } from 'earl'
import { privateKeyToAccount } from 'viem/accounts'

import { deserializeBatch, serializeAndSignBatch } from './BatchSerialize'
import { EthereumAddress } from './types/EthereumAddress'
import { Hex } from './types/Hex'
import { Transaction } from './types/Transactions'
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
  hash: Hex(
    '0x343d48c0e2c7852c9483a53a4017b7ab586140f0a0e31bc1b9e2e20a9900ea48',
  ),
}

const modelTxSerializedHex = Hex(
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b',
)

describe('serializeBatch', () => {
  it('serializes a single valid transaction', async () => {
    const bytes = await serializeAndSignBatch([modelTx], modelAccount)

    expect(bytes).toEqual(modelTxSerializedHex)
  })

  it('serializes two identical valid transactions', async () => {
    const bytes = await serializeAndSignBatch(
      new Array<Transaction>(2).fill(modelTx),
      modelAccount,
    )

    expect(bytes).toEqual(Hex(modelTxSerializedHex.slice(2).repeat(2)))
  })

  it('serializes a hundred identical valid transactions', async () => {
    const bytes = await serializeAndSignBatch(
      new Array<Transaction>(100).fill(modelTx),
      modelAccount,
    )

    expect(bytes).toEqual(Hex(modelTxSerializedHex.slice(2).repeat(100)))
  })

  it('deserializes two different valid transactions', async () => {
    const secondTx: Transaction = {
      from: EthereumAddress(modelAccount.address),
      to: EthereumAddress('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
      value: Unsigned64(258476297),
      nonce: Unsigned64(97061547),
      fee: Unsigned64(150364998),
      hash: Hex('0x0'),
    }
    const secondTxSerializedHex = Hex(
      '3C44CdDdB6a900fa2b585dd299e03d12FA4293BC000000000f6809090000000005c90aab0000000008f6634607dccbff6670601b0c34840bcd22a125add807855774225795843f3e5ebff6946776907ea9f0154719515a5460650d5b002f7990e9c995bfbff67e89ce0590501b',
    )

    const bytes = await serializeAndSignBatch([modelTx, secondTx], modelAccount)

    expect(bytes).toEqual(
      Hex(`${modelTxSerializedHex.slice(2)}${secondTxSerializedHex.slice(2)}`),
    )
  })
})

describe('deserializeBatch', () => {
  it('deserializes a single valid transaction', async () => {
    const batch = await deserializeBatch(modelTxSerializedHex)

    expect(batch.length).toEqual(1)
    expect(batch).toEqual([modelTx])
  })

  it('deserializes two identical valid transactions', async () => {
    const batch = await deserializeBatch(
      Hex(modelTxSerializedHex.slice(2).repeat(2)),
    )

    expect(batch.length).toEqual(2)
    expect(batch).toEqual([modelTx, modelTx])
  })

  it('deserializes a hundred identical valid transactions', async () => {
    const batch = await deserializeBatch(
      Hex(modelTxSerializedHex.slice(2).repeat(100)),
    )

    expect(batch.length).toEqual(100)
    expect(batch).toEqual(Array<Transaction>(100).fill(modelTx))
  })

  it('deserializes two different valid transactions', async () => {
    const secondTx = { ...modelTx }
    secondTx.to = Hex('0xcafe7970C51812dc3A010C7d01b50e0d17dc79C8')
    secondTx.from = Hex('0x491E388D88a808b9cA6547a7507daf29D4954BF7')
    secondTx.hash = Hex(
      '0x6acf80d210e85589d2fe24764e04ef379596d994cac505dab44ac0b2451fe88a',
    )
    const firstTxBytes = modelTxSerializedHex.slice(2)
    const secondTxBytes = `cafe${Hex.toString(modelTxSerializedHex).slice(6)}`

    const batch = await deserializeBatch(Hex(`${firstTxBytes}${secondTxBytes}`))

    expect(batch.length).toEqual(2)
    expect(batch).toEqual([modelTx, secondTx])
  })

  it('throws on smaller than a single transaction', async () => {
    await expect(() => deserializeBatch(Hex('0x707070707070'))).toBeRejected()
  })

  it('throws on not a multiplicitive of a single transaction', async () => {
    const bytes = Hex(`${modelTxSerializedHex.slice(2)}abacadaba`)

    await expect(() => deserializeBatch(bytes)).toBeRejected()
  })
})
