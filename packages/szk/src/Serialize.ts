import * as E from 'fp-ts/Either'
import { PrivateKeyAccount } from 'viem'

import { EthereumAddress } from './types/EthereumAddress'
import { Hex, SIGNED_TX_HEX_SIZE, Transaction } from './types/Transactions'
import { Unsigned64 } from './types/UnsignedSized'

export async function serialize(
    unsignedTx: Transaction,
    account: PrivateKeyAccount,
): Promise<Hex> {
    const signature = await account.signTypedData({
        domain: {
            name: "BYOR Sovereign Rollup",
            version: '1',
            chainId: 1,
            // TODO(radomski): Find this
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },

        types: {
            UnsignedTransaction: [
                { name: "to", type: 'address' },
                { name: "value", type: 'uint64' },
                { name: "nonce", type: 'uint64' },
                { name: "fee", type: 'uint64' }
            ]
        },
        primaryType: 'UnsignedTransaction',
        message: {
            to: EthereumAddress.toHex(unsignedTx.to),
            value: Unsigned64.toBigInt(unsignedTx.value),
            nonce: Unsigned64.toBigInt(unsignedTx.nonce),
            fee: Unsigned64.toBigInt(unsignedTx.fee),
        },
    })

    const toHex = unsignedTx.to.toString().slice(2)
    const valueHex = Unsigned64.toHex(unsignedTx.value).slice(2)
    const nonceHex = Unsigned64.toHex(unsignedTx.nonce).slice(2)
    const feeHex = Unsigned64.toHex(unsignedTx.fee).slice(2)
    const msg = `0x${toHex}${valueHex}${nonceHex}${feeHex}`

    const result: Hex = `0x${msg.slice(2)}${signature.slice(2)}`
    return result
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

    const tx: Transaction = {
        from: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
        to: EthereumAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(2),
        hash: new Uint8Array([1, 2, 3]),
    }

    return E.left(tx)
}
