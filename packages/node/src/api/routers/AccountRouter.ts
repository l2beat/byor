import { branded, EthereumAddress } from '@byor/shared'
import { z } from 'zod'

import { AccountRepository } from '../../db/AccountRepository'
import { publicProcedure, router } from '../trpc'

// NOTE(radomski): We need to propagte the return type
// from this function, we can not infer it
// eslint-disable-next-line
export function createAccountRouter(accountRepository: AccountRepository) {
  return router({
    getState: publicProcedure
      .input(branded(z.string(), EthereumAddress))
      .query((opts) => {
        const address = opts.input
        const account = accountRepository.getByAddressOrDefault(address)

        // NOTE(radomski): JSON is incapable of serializing a BigInt lol
        return {
          address: account.address.toString(),
          balance: account.balance.toString(),
          nonce: account.nonce.toString(),
        }
      }),
  })
}
