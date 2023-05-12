import { assert, expect } from 'chai'

import { EthereumAddress } from './EthereumAddress'

describe('EthereumAddress', function () {
  it('Should transform valid address', async function () {
    const address: EthereumAddress = EthereumAddress(
      '0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce',
    )
    expect(address).to.equal('0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce')
  })

  it('Should throw with invalid address', async function () {
    assert.throws(() =>
      EthereumAddress('0xdebdbcloremipsum999cc0e92e7aa4f5616e52ce'),
    )
  })
})
