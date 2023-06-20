import { expect } from 'earl'
import { formatTimeDifferenceFromNow } from './formatTimeDifferenceFromNow'

describe(formatTimeDifferenceFromNow.name, () => {
  it('failing, write tests', () => {
    expect(formatTimeDifferenceFromNow(Date.now() + 10000)).toEqual('1 day')
  })
})
