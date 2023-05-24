import { branded, Hex } from '@byor/shared'
import { AnyRouter, TRPCError } from '@trpc/server'
import { z } from 'zod'

import { MempoolController } from '../../peripherals/mempool/MempoolController'
import { publicProcedure, router } from '../trpc'

export function createTransactionRouter(
  mempoolController: MempoolController,
): AnyRouter {
  return router({
    submit: publicProcedure
      .input(branded(z.string(), Hex))
      .mutation(async (opts) => {
        const { input } = opts
        try {
          await mempoolController.tryToAdd(input)
        } catch (e) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid batch data',
            cause: e,
          })
        }
      }),
  })
}
