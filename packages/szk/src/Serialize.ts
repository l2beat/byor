import * as E from 'fp-ts/Either'
import { PrivateKeyAccount, hashTypedData, recoverAddress, recoverTypedDataAddress, verifyTypedData } from 'viem'

import { EthereumAddress } from './types/EthereumAddress'
import { Hex, SIGNED_TX_HEX_SIZE, Transaction, UnsignedTransaction } from './types/Transactions'
import { Unsigned64 } from './types/UnsignedSized'

const domain = {
    name: "BYOR Sovereign Rollup",
    version: '1',
    chainId: 1,
    // TODO(radomski): Find this
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC' as Hex,
}

const types = {
    UnsignedTransaction: [
        { name: "to", type: 'address' },
        { name: "value", type: 'uint64' },
        { name: "nonce", type: 'uint64' },
        { name: "fee", type: 'uint64' }
    ]
}

const primaryType = 'UnsignedTransaction'

export async function serialize(
    unsignedTx: Transaction,
    account: PrivateKeyAccount,
): Promise<Hex> {
    const signature = await account.signTypedData({
        domain: domain,
        types: types,
        primaryType: primaryType,
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
                `Serialized transaction byte array too small or too big, got/expected => ${signedTxBytes.length}/${SIGNED_TX_HEX_SIZE}`,
            ),
        )
    }

    const hex = signedTxBytes.substring(2);
    const unsignedTx: UnsignedTransaction = {
        to: EthereumAddress(`0x${hex.substring(0, 40)}`),
        value: Unsigned64.fromHex(`0x${hex.substring(40, 56)}`),
        nonce: Unsigned64.fromHex(`0x${hex.substring(56, 72)}`),
        fee: Unsigned64.fromHex(`0x${hex.substring(72, 88)}`),
    }

    const signature: Hex = `0x${hex.substring(88)}`
    const hash: Hex = hashTypedData({
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

    const signer = await recoverAddress({ hash, signature })

    const tx: Transaction = {
        from: EthereumAddress(signer),
        to: unsignedTx.to,
        value: unsignedTx.value,
        nonce: unsignedTx.nonce,
        fee: unsignedTx.fee,
        hash: hash,
    }

    return E.left(tx)
}
