import { EthereumAddress, Unsigned64 } from '@byor/shared'
import { mockFn, mockObject } from 'earl'

import { AccountRepository } from '../../db/AccountRepository'
import { createAccountRouter } from './AccountRouter'
import { createTestApiServer } from './test/createTestApiServer'

describe(createAccountRouter.name, () => {
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
      .expect(200)
    await server.get('/router.getState').expect(400)
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

    await server.get('/router.getState').expect(400)
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
      .expect(400)
    await server.get('/router.getState?input="0x1234"').expect(400)
    await server
      .get(
        '/router.getState?input="0x00000000000000000000000000000000000000000"',
      )
      .expect(400)
  })
})
