import { PrivateKeyAccount } from 'viem'

import { deserialize, serialize, serializeAndSign } from './Serialize'
import { Hex } from './types/Hex'
import {
  SIGNED_TX_ASCII_SIZE,
  SignedTransaction,
  Transaction,
} from './types/Transactions'

export async function serializeAndSignBatch(
  unsignedBatch: Transaction[],
  account: PrivateKeyAccount,
): Promise<Hex> {
  const parts: string[] = []
  for (const tx of unsignedBatch) {
    const bytes = await serializeAndSign(tx, account)
    parts.push(Hex.removePrefix(bytes))
  }

  return Hex(parts.join(''))
}

export function serializeBatch(signedBatch: SignedTransaction[]): Hex {
  return signedBatch.map(serialize).reduce(Hex.concat)
}

export async function deserializeBatch(
  signedBatchBytes: Hex,
): Promise<SignedTransaction[]> {
  const result: SignedTransaction[] = []

  const bytes = Hex.removePrefix(signedBatchBytes)
  if (bytes.length % SIGNED_TX_ASCII_SIZE !== 0) {
    throw new Error(
      'Length of input bytes is not multiple of SIGNED_TX_HEX_SIZE',
    )
  }

  const txCount = bytes.length / SIGNED_TX_ASCII_SIZE

  for (let i = 0; i < txCount; i++) {
    const signedTxBytes = Hex(
      bytes.slice(i * SIGNED_TX_ASCII_SIZE, (i + 1) * SIGNED_TX_ASCII_SIZE),
    )

    result.push(await deserialize(signedTxBytes))
  }

  return result
}
