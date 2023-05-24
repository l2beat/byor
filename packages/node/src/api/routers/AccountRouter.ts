import { AnyRouter } from '@trpc/server'

import { AccountRepository } from '../../db/AccountRepository'
import { publicProcedure, router } from '../trpc/trpc'
import { z } from 'zod'
import { EthereumAddress } from '@byor/shared'

export function createAccountRouter(
  accountRepository: AccountRepository,
): AnyRouter {
  return router({
    getState: publicProcedure
      .input(z.string().refine(EthereumAddress.check))
      .query(async (opts) => {
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
