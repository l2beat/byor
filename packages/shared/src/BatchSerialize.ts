import { PrivateKeyAccount } from 'viem'

import { deserialize, serialize, serializeAndSign } from './Serialize'
import { Hex } from './types/Hex'
import {
  SIGNED_TX_SIZE,
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
  return Hex.concat(...signedBatch.map(serialize))
}

export async function deserializeBatch(
  signedBatchBytes: Hex,
): Promise<SignedTransaction[]> {
  const result: SignedTransaction[] = []

  const length = Hex.getLength(signedBatchBytes)
  if (length % SIGNED_TX_SIZE !== 0) {
    throw new Error('Length of input bytes is not multiple of SIGNED_TX_SIZE')
  }

  const txCount = length / SIGNED_TX_SIZE
  for (let i = 0; i < txCount; i++) {
    const signedTxBytes = Hex.slice(
      signedBatchBytes,
      i * SIGNED_TX_SIZE,
      (i + 1) * SIGNED_TX_SIZE,
    )
    result.push(await deserialize(signedTxBytes))
  }

  return result
}
