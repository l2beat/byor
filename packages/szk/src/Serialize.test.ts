import { expect } from 'chai'
import * as E from 'fp-ts/Either'
import { privateKeyToAccount } from 'viem/accounts'

import { deserialize, serialize } from './Serialize'
import { EthereumAddress } from './types/EthereumAddress'
import {
  SIGNED_TX_SIZE as SIGNED_TX_HEX_SIZE,
  Transaction,
} from './types/Transactions'
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

describe('serialize', function () {
  it('Should serialize a valid transaction', async function () {
    const serialized = await serialize(modelTx, modelAccount)
    expect(serialized.length).to.equal(SIGNED_TX_HEX_SIZE * 2 + 2)
    expect(serialized).to.equal(
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b',
    )
  })
})

describe('deserialize', function () {
  it('Should error on deserialize with too small of a input', async function () {
    const signedTxBytes = '0x01'

    const deserialized = await deserialize(signedTxBytes)
    expect(E.isRight(deserialized)).true
  })

  it('Should error on invalid signature', async function () {
    const signedTxBytes =
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13123f481d0331b'

    const deserialized = await deserialize(signedTxBytes)
    expect(E.isLeft(deserialized)).true

    const tx: Transaction = deserialized.left
    expect(tx).not.to.deep.equal(modelTx)
  })

  it('Should deserialize a valid input', async function () {
    const signedTxBytes =
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b'

    const deserialized = await deserialize(signedTxBytes)
    expect(E.isLeft(deserialized)).true

    const tx: Transaction = deserialized.left
    expect(tx).to.deep.equal(modelTx)
  })
})
