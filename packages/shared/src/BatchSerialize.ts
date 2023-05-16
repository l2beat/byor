import { PrivateKeyAccount } from 'viem'

import { deserialize, serializeAndSign } from './Serialize'
import { TransactionBatch } from './types/Batch'
import { Hex } from './types/Hex'
import { SIGNED_TX_SIZE, Transaction } from './types/Transactions'

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

  let bytes = signedBatchBytes.slice(2)
  if (bytes.length % (SIGNED_TX_SIZE * 2) !== 0) {
    throw new Error(
      'Length of input bytes is not multiple of SIGNED_TX_HEX_SIZE',
    )
  }

  const txCount = bytes.length / (SIGNED_TX_SIZE * 2)

  for (let i = 0; i < txCount; i++) {
    const signedTxBytes = Hex(bytes.slice(0, SIGNED_TX_SIZE * 2))
    bytes = bytes.slice(SIGNED_TX_SIZE * 2)

    result.push(await deserialize(signedTxBytes))
  }

  return result
}
