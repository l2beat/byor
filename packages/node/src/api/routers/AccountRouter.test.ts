import { EthereumAddress, Unsigned64 } from '@byor/shared'
import { mockFn, mockObject } from 'earl'

import { AccountRepository } from '../../db/AccountRepository'
import { createAccountRouter } from './AccountRouter'
import { createTestApiServer } from './test/createTestApiServer'

describe(createAccountRouter.name, () => {
  it('returns an existing account', async () => {
    const accountRepository = mockObject<AccountRepository>({
      getByAddressOrDefault: mockFn().returnsOnce({
        address: EthereumAddress('0xaabbccddeeffaabbccddeeffaabbccddeeffaabb'),
        balance: Unsigned64(1410),
        nonce: Unsigned64(59),
      }),
    })
    const router = createAccountRouter(accountRepository)
    const server = createTestApiServer({ router })

    await server
      .get(
        '/router.getState?input="0xaabbccddeeffaabbccddeeffaabbccddeeffaabb"',
      )
      .expect('Content-Type', /json/)
      .expect(
        200,
        '{"result":{"data":{"address":"0xaabbccddeeffaabbccddeeffaabbccddeeffaabb","balance":"1410","nonce":"59"}}}',
      )
  })

  it('returns an account on non-existent valid address', async () => {
    const accountRepository = mockObject<AccountRepository>({
      getByAddressOrDefault: mockFn().returnsOnce({
        address: EthereumAddress.ZERO,
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      }),
    })
    const router = createAccountRouter(accountRepository)
    const server = createTestApiServer({ router })

    await server
      .get(
        '/router.getState?input="0x0000000000000000000000000000000000000000"',
      )
      .expect('Content-Type', /json/)
      .expect(
        200,
        '{"result":{"data":{"address":"0x0000000000000000000000000000000000000000","balance":"0","nonce":"0"}}}',
      )
  })

  it('returns bad request on no data', async () => {
    const accountRepository = mockObject<AccountRepository>({
      getByAddressOrDefault: mockFn().returnsOnce({
        address: EthereumAddress.ZERO,
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      }),
    })
    const router = createAccountRouter(accountRepository)
    const server = createTestApiServer({ router })

    await server
      .get('/router.getState')
      .expect('Content-Type', /json/)
      .expect(400)
  })

  it('returns bad request on invalid data', async () => {
    const accountRepository = mockObject<AccountRepository>({
      getByAddressOrDefault: mockFn().returnsOnce({
        address: EthereumAddress.ZERO,
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      }),
    })
    const router = createAccountRouter(accountRepository)
    const server = createTestApiServer({ router })

    await server
      .get('/router.getState?input="0xthisistooshortandnothex"')
      .expect('Content-Type', /json/)
      .expect(400)
    await server
      .get('/router.getState?input="0x1234"')
      .expect('Content-Type', /json/)
      .expect(400)
    await server
      .get(
        '/router.getState?input="0x00000000000000000000000000000000000000000"',
      )
      .expect('Content-Type', /json/)
      .expect(400)
  })
})
