import { PrivateKeyAccount } from 'viem'

import { deserialize, serializeAndSign } from './Serialize'
import { TransactionBatch } from './types/Batch'
import { Hex } from './types/Hex'
import { SIGNED_TX_ASCII_SIZE, Transaction } from './types/Transactions'

export async function serializeAndSignBatch(
  unsignedBatch: TransactionBatch,
  account: PrivateKeyAccount,
): Promise<Hex> {
  const parts = new Array<string>()
  for (const tx of unsignedBatch) {
    const bytes = await serializeAndSign(tx, account)
    parts.push(bytes.slice(2))
  }

  return Hex(parts.join(''))
}

export async function deserializeBatch(
  signedBatchBytes: Hex,
): Promise<TransactionBatch> {
  const result = new Array<Transaction>()

  const bytes = signedBatchBytes.slice(2)
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
