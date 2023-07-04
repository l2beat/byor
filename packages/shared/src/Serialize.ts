import { hashTypedData, PrivateKeyAccount, recoverAddress } from 'viem'

import { getTypedDataDomain } from './getTypedDataDomain'
import { EthereumAddress } from './types/EthereumAddress'
import { Hex } from './types/Hex'
import {
  SIGNED_TX_HEX_SIZE,
  SignedTransaction,
  Transaction,
  UnsignedTransaction,
} from './types/Transactions'
import { Unsigned8 } from './types/Unsigned8'
import { Unsigned64 } from './types/Unsigned64'

export const typedDataTypes = {
  UnsignedTransaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'fee', type: 'uint64' },
  ],
}

export const typedDataPrimaryType = 'UnsignedTransaction'

export function hashTransaction(unsignedTx: Transaction): Hex {
  const hash = Hex(
    hashTypedData({
      domain: getTypedDataDomain(),
      types: typedDataTypes,
      primaryType: typedDataPrimaryType,
      message: {
        to: EthereumAddress.toHex(unsignedTx.to),
        value: unsignedTx.value.valueOf(),
        nonce: unsignedTx.nonce.valueOf(),
        fee: unsignedTx.fee.valueOf(),
      },
    }),
  )

  return hash
}

export async function serializeAndSign(
  unsignedTx: Transaction,
  account: PrivateKeyAccount,
): Promise<Hex> {
  const signature = Hex(
    await account.signTypedData({
      domain: getTypedDataDomain(),
      types: typedDataTypes,
      primaryType: typedDataPrimaryType,
      message: {
        to: EthereumAddress.toHex(unsignedTx.to),
        value: unsignedTx.value.valueOf(),
        nonce: unsignedTx.nonce.valueOf(),
        fee: unsignedTx.fee.valueOf(),
      },
    }),
  )

  const signedTx: SignedTransaction = {
    ...unsignedTx,
    r: Hex(signature.substring(2, 66)),
    s: Hex(signature.substring(66, 130)),
    v: Unsigned8(parseInt(signature.substring(130, 132), 16)),
  }

  return serialize(signedTx)
}

export function serialize(signedTx: SignedTransaction): Hex {
  const toHex = signedTx.to.toString().slice(2)
  const valueHex = Unsigned64.toHex(signedTx.value).slice(2)
  const nonceHex = Unsigned64.toHex(signedTx.nonce).slice(2)
  const feeHex = Unsigned64.toHex(signedTx.fee).slice(2)
  const rHex = signedTx.r.toString().slice(2)
  const sHex = signedTx.s.toString().slice(2)
  const vHex = Unsigned8.toHex(signedTx.v).slice(2)
  const signature = `0x${rHex}${sHex}${vHex}`
  const msg = `0x${toHex}${valueHex}${nonceHex}${feeHex}`

  const result = Hex(`${msg.slice(2)}${signature.slice(2)}`)
  return result
}

export async function deserialize(
  signedTxBytes: Hex,
): Promise<SignedTransaction> {
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
    domain: getTypedDataDomain(),
    types: typedDataTypes,
    primaryType: typedDataPrimaryType,
    message: {
      to: EthereumAddress.toHex(unsignedTx.to),
      value: unsignedTx.value.valueOf(),
      nonce: unsignedTx.nonce.valueOf(),
      fee: unsignedTx.fee.valueOf(),
    },
  })

  const signer = await recoverAddress({
    hash,
    signature: signature.toString(),
  })

  const tx = unsignedTx as Transaction
  tx.from = EthereumAddress(signer)
  tx.hash = Hex(hash)

  const signedTx = unsignedTx as SignedTransaction
  signedTx.r = Hex(signature.substring(2, 66))
  signedTx.s = Hex(signature.substring(66, 130))
  signedTx.v = Unsigned8(parseInt(signature.substring(130, 132), 16))

  return signedTx
}

export async function deserializeAndVerify(
  signedTxBytes: Hex,
  signerAddress: EthereumAddress,
): Promise<SignedTransaction> {
  const tx = await deserialize(signedTxBytes)

  if (tx.from === signerAddress) {
    return tx
  } else {
    throw new Error('Recovered address does not match the one provided')
  }
}
