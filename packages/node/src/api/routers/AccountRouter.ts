import { branded, EthereumAddress } from '@byor/shared'
import { z } from 'zod'

import { AccountRepository } from '../../db/AccountRepository'
import { publicProcedure, router } from '../trpc'

export function createAccountRouter(
  accountRepository: AccountRepository,
) {
  return router({
    getState: publicProcedure
      .input(branded(z.string(), EthereumAddress))
      .query((opts) => {
        const { input } = opts
        const account = accountRepository.getByAddressOrDefault(input)
        console.log(account)

        // NOTE(radomski): JSON is incapable of serializing a BigInt lol
        return {
          address: account.address.toString(),
          balance: account.balance.toString(),
          nonce: account.nonce.toString(),
        }
      }),
  })
}
