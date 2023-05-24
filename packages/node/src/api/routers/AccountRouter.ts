import { EthereumAddress } from '@byor/shared'
import { AnyRouter } from '@trpc/server'
import { z } from 'zod'

import { AccountRepository } from '../../db/AccountRepository'
import { publicProcedure, router } from '../trpc/trpc'

export function createAccountRouter(
  accountRepository: AccountRepository,
): AnyRouter {
  return router({
    getState: publicProcedure
      .input(z.string().refine(EthereumAddress.check))
      .query((opts) => {
        const { input } = opts
        const account = accountRepository.getByAddressInsertOnEmpty(
          EthereumAddress(input),
        )

        // NOTE(radomski): JSON is incapable of serializing a BigInt lol
        return {
          address: account.address.toString(),
          balance: account.balance.toString(),
          nonce: account.nonce.toString(),
        }
      }),
  })
}
