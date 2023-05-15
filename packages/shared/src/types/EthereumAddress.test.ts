import { assert, expect } from 'earl'

import { EthereumAddress } from './EthereumAddress'

describe('EthereumAddress', function () {
  it('Should transform valid address', async function () {
    const address: EthereumAddress = EthereumAddress(
      '0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce',
    )

    expect(address).toEqual('0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce')
  })

  it('Should throw with invalid address', async function () {
    expect(() =>
      EthereumAddress('0xdebdbcloremipsum999cc0e92e7aa4f5616e52ce'),
    ).toThrow()
  })
})
