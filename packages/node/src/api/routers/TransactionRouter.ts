import { branded, deserializeBatch, Hex } from '@byor/shared'
import { AnyRouter, TRPCError } from '@trpc/server'
import { z } from 'zod'

import { Mempool } from '../../peripherals/mempool/Mempool'
import { publicProcedure, router } from '../trpc'

export function createTransactionRouter(
  transactionMempool: Mempool,
): AnyRouter {
  return router({
    submit: publicProcedure
      .input(branded(z.string(), Hex))
      .mutation(async (opts) => {
        const { input } = opts
        try {
          const deserialized = await deserializeBatch(input) // Validate bytes
          transactionMempool.add(deserialized)
        } catch (e) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid batch data`,
            cause: e,
          })
        }
      }),
  })
}
