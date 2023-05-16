import { expect } from 'earl'

import { EthereumAddress } from './EthereumAddress'

describe('EthereumAddress', () => {
  it('transformes a valid address', async () => {
    const address: EthereumAddress = EthereumAddress(
      '0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce',
    )

    expect(address).toBeA(String)
    expect(address).toEqual(
      '0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce' as unknown as EthereumAddress,
    )
  })

  it('throws with invalid address', async () => {
    expect(() =>
      EthereumAddress('0xdebdbcloremipsum999cc0e92e7aa4f5616e52ce'),
    ).toThrow()
  })
})
