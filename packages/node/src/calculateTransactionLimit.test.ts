import { expect } from 'earl'

import { calculateTransactionLimit } from './calculateTransactionLimit'

describe(calculateTransactionLimit.name, () => {
  it('3 million gas', () => {
    expect(calculateTransactionLimit(3000000)).toEqual(1705)
  })

  it('1 million gas', () => {
    expect(calculateTransactionLimit(1000000)).toEqual(559)
  })

  it('100 thousand gas', () => {
    expect(calculateTransactionLimit(100000)).toEqual(43)
  })

  it('25 thousand gas', () => {
    expect(calculateTransactionLimit(25000)).toEqual(0)
  })
})
