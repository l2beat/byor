import { branded, EthereumAddress } from '@byor/shared'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { AccountRepository } from '../../db/AccountRepository'
import { publicProcedure, router } from '../trpc'

export function createAccountRouter(accountRepository: AccountRepository) {
  return router({
    getState: publicProcedure.input(z.string()).query((opts) => {
      let address = EthereumAddress.ZERO
      try {
        address = branded(z.string(), EthereumAddress).parse(opts.input)
      } catch (_) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '"Input is not an EthereumAddress',
        })
      }
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
