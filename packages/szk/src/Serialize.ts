import * as E from 'fp-ts/Either'
import { hashMessage, PrivateKeyAccount } from 'viem'

import {
  Hex,
  SIGNED_TX_HEX_SIZE,
  Transaction,
  Unsigned64,
} from './Transactions'

export async function serialize(
  unsignedTx: Transaction,
  account: PrivateKeyAccount,
): Promise<Hex> {
  const toHex = unsignedTx.to.toString()
  const valueHex = Unsigned64.toHex(unsignedTx.value)
  const nonceHex = Unsigned64.toHex(unsignedTx.nonce)
  const feeHex = Unsigned64.toHex(unsignedTx.fee)

  const msg = `0x${toHex.slice(2)}${valueHex.slice(2)}${nonceHex.slice(
    2,
  )}${feeHex.slice(2)}`
  const msgHash = hashMessage(msg)
  // TODO(radomski): why is this returning something different then I get from cyberchef??
  // console.log(msgHash)
  const signature = await account.signMessage({ message: msgHash })

  const result = `0x${msg.slice(2)}${signature.slice(2)}${msgHash.slice(2)}`
  return result as Hex
}

export async function deserialize(
  signedTxBytes: Hex,
): Promise<E.Either<Transaction, Error>> {
  if (signedTxBytes.length !== SIGNED_TX_HEX_SIZE) {
    return E.right(
      new Error(
        `Serialized transaction byte array too small, got/expected => ${signedTxBytes.length}/${SIGNED_TX_HEX_SIZE}`,
      ),
    )
  }

  return E.right(new Error('test'))
}
