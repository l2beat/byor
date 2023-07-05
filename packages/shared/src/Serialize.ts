import { hashTypedData, PrivateKeyAccount, recoverAddress } from 'viem'

import { getTypedDataDomain } from './getTypedDataDomain'
import { EthereumAddress } from './types/EthereumAddress'
import { Hex } from './types/Hex'
import {
  SIGNED_TX_SIZE,
  SignedTransaction,
  Transaction,
  UnsignedTransaction,
} from './types/Transactions'
import { Unsigned8 } from './types/Unsigned8'
import { Unsigned64 } from './types/Unsigned64'

export const TYPED_DATA_TYPES = {
  UnsignedTransaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'fee', type: 'uint64' },
  ],
}

export const TYPED_DATA_PRIMARY_TYPE = 'UnsignedTransaction'

// We actually want the type of this function to be inferred
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getTypedData(unsignedTx: UnsignedTransaction) {
  return {
    domain: getTypedDataDomain(),
    types: TYPED_DATA_TYPES,
    primaryType: TYPED_DATA_PRIMARY_TYPE,
    message: {
      to: unsignedTx.to,
      value: unsignedTx.value,
      nonce: unsignedTx.nonce,
      fee: unsignedTx.fee,
    },
  } as const
}

export function hashTransaction(unsignedTx: Transaction): Hex {
  const result = hashTypedData(getTypedData(unsignedTx))
  return Hex(result)
}

export async function serializeAndSign(
  unsignedTx: Transaction,
  account: PrivateKeyAccount,
): Promise<Hex> {
  const signature = Hex(await account.signTypedData(getTypedData(unsignedTx)))
  return serialize({
    ...unsignedTx,
    r: Hex.slice(signature, 0, 32),
    s: Hex.slice(signature, 32, 64),
    v: Unsigned8(parseInt(Hex.slice(signature, 64, 65).toString(), 16)),
  })
}

export function serialize(signedTx: SignedTransaction): Hex {
  return Hex.concat(
    EthereumAddress.toHex(signedTx.to),
    Unsigned64.toHex(signedTx.value),
    Unsigned64.toHex(signedTx.nonce),
    Unsigned64.toHex(signedTx.fee),
    signedTx.r,
    signedTx.s,
    Unsigned8.toHex(signedTx.v),
  )
}

export async function deserialize(
  signedTxBytes: Hex,
): Promise<SignedTransaction> {
  const length = Hex.byteLength(signedTxBytes)
  if (length !== SIGNED_TX_SIZE) {
    throw new Error(
      `Invalid input size, got ${length}, expected ${SIGNED_TX_SIZE}`,
    )
  }

  const unsignedTx: UnsignedTransaction = {
    to: EthereumAddress(Hex.slice(signedTxBytes, 0, 20)),
    value: Unsigned64.fromHex(Hex.slice(signedTxBytes, 20, 28)),
    nonce: Unsigned64.fromHex(Hex.slice(signedTxBytes, 28, 36)),
    fee: Unsigned64.fromHex(Hex.slice(signedTxBytes, 36, 44)),
  }

  const hash = hashTypedData(getTypedData(unsignedTx))

  const signature = Hex.slice(signedTxBytes, 44)
  const signer = await recoverAddress({
    hash,
    signature: signature.toString(),
  })

  return {
    ...unsignedTx,
    from: EthereumAddress(signer),
    hash: Hex(hash),
    r: Hex.slice(signature, 0, 32),
    s: Hex.slice(signature, 32, 64),
    v: Unsigned8(parseInt(Hex.slice(signature, 64, 65).toString(), 16)),
  }
}

export async function deserializeAndVerify(
  signedTxBytes: Hex,
  signerAddress: EthereumAddress,
): Promise<SignedTransaction> {
  const tx = await deserialize(signedTxBytes)
  if (tx.from !== signerAddress) {
    throw new Error('Recovered address does not match the one provided')
  }
  return tx
}
