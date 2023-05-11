import { hashMessage } from "viem";
import { Transaction, Unsigned64, Hex } from "./Transactions"
import { PrivateKeyAccount } from 'viem/accounts'

export async function serialize(unsignedTx: Transaction, account: PrivateKeyAccount): Promise<Hex> {
    const toHex = unsignedTx.to.toString();
    const valueHex = Unsigned64.toHex(unsignedTx.value);
    const nonceHex = Unsigned64.toHex(unsignedTx.nonce);
    const feeHex = Unsigned64.toHex(unsignedTx.fee);

    const msg = `0x${toHex.slice(2)}${valueHex.slice(2)}${nonceHex.slice(2)}${feeHex.slice(2)}`;
    const msgHash = hashMessage(msg);
    console.log(msgHash)
    const signature = await account.signMessage({ message: msgHash });

    const result = `0x${msg.slice(2)}${signature.slice(2)}${msgHash.slice(2)}`
    return result as Hex;
}
