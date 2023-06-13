// TODO(radomski): Move this to some configuration file
export const typedDataDomain = {
  name: 'BYOR Sovereign Rollup',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const

export const typedDataTypes = {
  UnsignedTransaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'fee', type: 'uint64' },
  ],
}

export const typedDataPrimaryType = 'UnsignedTransaction'
