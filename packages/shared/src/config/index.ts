import { TypedDataDomain } from 'abitype'

import { localTypedDataDomain } from './localTypedData'
import { productionTypedDataDomain } from './productionTypedData'

export * from './getChain'

export function getTypedDataDomain(): TypedDataDomain {
  if (process.env.NODE_ENV === 'production') {
    return productionTypedDataDomain
  }

  return localTypedDataDomain
}

export const typedDataTypes = {
  UnsignedTransaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'fee', type: 'uint64' },
  ],
}

export const typedDataPrimaryType = 'UnsignedTransaction'
