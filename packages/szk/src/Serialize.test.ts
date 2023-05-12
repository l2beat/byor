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

describe('serialize', function () {
  const account = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  )
  const tx: Transaction = {
    from: EthereumAddress(account.address),
    to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    value: Unsigned64(10),
    nonce: Unsigned64(1),
    fee: Unsigned64(2),
    hash: new Uint8Array([1, 2, 3]),
  }

  it('Should serialize a valid transaction', async function () {
    const serialized = await serialize(tx, account)
    expect(serialized.length).to.equal(SIGNED_TX_HEX_SIZE * 2 + 2)
    expect(serialized).to.equal(
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002950e2f5c8514196afc5ba38e0d10638d3f4061d6d0b62573ad47808587f92f9867d72774c53d2e64d4fcc6fb9f5526be2a93a68514109d0292c13656f481d0331b',
    )
  })
})

describe('deserialize', function () {
  it('Should error on deserialize with too small of a input', async function () {
    const signedTxBytes =
      '0x01'

    const deserialized = await deserialize(signedTxBytes)
    expect(E.isRight(deserialized)).true
  })

  it('Should error on invalid signature', async function () {
    const signedTxBytes =
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002b8d9f3f544905ff0cc78c07f9c2c4f67286da8affc09d520f28dc037f82b51b065ca9a91715ec9b81a8bc8bf9589b57f1cbe59ef779fead2eace3556084c278b1c0ff47fd256b3ce98a4d87e1944fa74df26282b50ad3f5fca48688e2673b86bca'

    const deserialized = await deserialize(signedTxBytes)
    expect(E.isRight(deserialized)).true
  })

  it('Should deserialize a valid input', async function () {
    const signedTxBytes =
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8000000000000000a00000000000000010000000000000002b8d9f3f544905ff0cc78c07f9c2c4f67286da8affc09d520f28dc037f82b51b065ca9a91715ec9b81a8bc8bf9589b57f1cbe59ef779fead2eace3556084c278b1c0ff47fd256b3ce98a4d87e1944fa74df26282b50ad3f5fca48688e2673b86bca'

    const deserialized = await deserialize(signedTxBytes)
    expect(E.isLeft(deserialized)).true
  })
})
