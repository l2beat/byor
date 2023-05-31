import { expect } from 'earl'

import { EthereumAddress } from './EthereumAddress'

describe('EthereumAddress', () => {
  it('transformes a valid address', async () => {
    const address: EthereumAddress = EthereumAddress(
      '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    )

    expect(address).toBeA(String)
    expect(address).toEqual(
      '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720' as unknown as EthereumAddress,
    )
  })

  it('transformes a valid address to EIP-1191', async () => {
    const address: EthereumAddress = EthereumAddress(
      '0xa35cdbd9a448b82cdec0767b687ad3fa543613df',
    )

    expect(address).toBeA(String)
    expect(address).toEqual(
      '0xA35cdbD9a448b82cdEC0767B687aD3fA543613df' as unknown as EthereumAddress,
    )
  })

  it('throws with invalid address', async () => {
    expect(() =>
      EthereumAddress('0xdebdbcloremipsum999cc0e92e7aa4f5616e52ce'),
    ).toThrow()
  })
})
