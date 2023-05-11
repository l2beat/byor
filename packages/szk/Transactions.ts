import { isAddress } from 'viem';

export interface EthereumAddress extends String {
    _Value: string;
}
export function EthereumAddress(value: string): EthereumAddress {
    if(isAddress(value)) {
        return value as unknown as EthereumAddress;
    } else {
        throw new Error("Invalid Ethereum address");
    }
}

export type Unsigned64 = BigInt;
export function Unsigned64(value: bigint | number) {
    if(typeof value == 'number') {
        try {
            value = BigInt(value)
        } catch(e) {
            throw new Error(`Invalid value of type number passed ${e}`)
        }
    }

    const MAX_U64 = (1n << 64n);
    const MIN_U64 = 0n;
    if(value >= MIN_U64 && value <= MAX_U64) {
        return value;
    } else {
        throw new Error("Value not in unsigned 64bit range");
    }
}

export interface UnsignedTransaction {
    to: EthereumAddress,
    value: Unsigned64,
    nonce: Unsigned64,
    fee: Unsigned64,
};
