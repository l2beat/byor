import {
  hashTypedData,
  Hex as ViemHex,
  PrivateKeyAccount,
  recoverAddress,
} from 'viem'

import { EthereumAddress } from './types/EthereumAddress'
import { Hex } from './types/Hex'
import {
  SIGNED_TX_HEX_SIZE,
  Transaction,
  UnsignedTransaction,
} from './types/Transactions'
import { Unsigned64 } from './types/UnsignedSized'

// TODO(radomski): Move this to some configuration file
const domain = {
  name: 'BYOR Sovereign Rollup',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const

const types = {
  UnsignedTransaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'fee', type: 'uint64' },
  ],
}

const primaryType = 'UnsignedTransaction'

export async function serializeAndSign(
  unsignedTx: Transaction,
  account: PrivateKeyAccount,
): Promise<Hex> {
  const signature = Hex(
    await account.signTypedData({
      domain: domain,
      types: types,
      primaryType: primaryType,
      message: {
        to: EthereumAddress.toHex(unsignedTx.to),
        value: Unsigned64.toBigInt(unsignedTx.value),
        nonce: Unsigned64.toBigInt(unsignedTx.nonce),
        fee: Unsigned64.toBigInt(unsignedTx.fee),
      },
    }),
  )

  return serialize(unsignedTx, signature)
}

export function serialize(unsignedTx: Transaction, signature: Hex): Hex {
  const toHex = unsignedTx.to.toString().slice(2)
  const valueHex = Unsigned64.toHex(unsignedTx.value).slice(2)
  const nonceHex = Unsigned64.toHex(unsignedTx.nonce).slice(2)
  const feeHex = Unsigned64.toHex(unsignedTx.fee).slice(2)
  const msg = `0x${toHex}${valueHex}${nonceHex}${feeHex}`

  const result = Hex(`${msg.slice(2)}${signature.slice(2)}`)
  return result
}

export async function deserialize(signedTxBytes: Hex): Promise<Transaction> {
  if (signedTxBytes.length !== SIGNED_TX_HEX_SIZE) {
    throw new Error(
      `Invalid input size, got/expected = ${signedTxBytes.length}/${SIGNED_TX_HEX_SIZE}`,
    )
  }

  const hex = signedTxBytes.substring(2)
  const unsignedTx: UnsignedTransaction = {
    to: EthereumAddress(`0x${hex.substring(0, 40)}`),
    value: Unsigned64.fromHex(Hex(`0x${hex.substring(40, 56)}`)),
    nonce: Unsigned64.fromHex(Hex(`0x${hex.substring(56, 72)}`)),
    fee: Unsigned64.fromHex(Hex(`0x${hex.substring(72, 88)}`)),
  }

  const signature = Hex(hex.substring(88))
  const hash = hashTypedData({
    domain,
    types,
    primaryType,
    message: {
      to: EthereumAddress.toHex(unsignedTx.to),
      value: Unsigned64.toBigInt(unsignedTx.value),
      nonce: Unsigned64.toBigInt(unsignedTx.nonce),
      fee: Unsigned64.toBigInt(unsignedTx.fee),
    },
  })

  const signer = await recoverAddress({
    hash,
    signature: Hex.toString(signature) as ViemHex,
  })

  const tx = unsignedTx as Transaction
  tx.from = EthereumAddress(signer)
  tx.hash = Hex(hash)

  return tx
}

export async function deserializeAndVerify(
  signedTxBytes: Hex,
  signerAddress: EthereumAddress,
): Promise<Transaction> {
  const tx = await deserialize(signedTxBytes)

  if (tx.from === signerAddress) {
    return tx
  } else {
    throw new Error('Recovered address does not match the one provided')
  }
}
