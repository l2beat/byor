import { expect } from 'earl'

import { getEnv } from './getEnv'

describe(getEnv.name, () => {
  it('returns the environment variable', () => {
    process.env.TEST_A = 'foo'
    const result = getEnv('TEST_A')
    expect(result).toEqual('foo')
  })

  it('returns the fallback if the variable is not present', () => {
    delete process.env.TEST_A
    const result = getEnv('TEST_A', 'bar')
    expect(result).toEqual('bar')
  })

  it('throws if variable is not present and there is no fallback', () => {
    delete process.env.TEST_A
    expect(() => getEnv('TEST_A')).toThrow()
  })
})
