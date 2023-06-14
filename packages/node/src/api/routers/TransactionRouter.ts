import { branded, deserializeBatch, Hex } from '@byor/shared'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { Mempool } from '../../peripherals/mempool/Mempool'
import { publicProcedure, router } from '../trpc'
import { TransactionRepository } from '../../db/TransactionRepository'

type TransactionStatus = 'Not found' | 'Commited' | 'Soft commited'

// NOTE(radomski): We need to propagte the return type
// from this function, we can not infer it
// eslint-disable-next-line
export function createTransactionRouter(
  transactionMempool: Mempool,
  transactionRepository: TransactionRepository,
) {
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
    getStatus: publicProcedure
      .input(
        branded(z.string(), Hex).refine((a: Hex) => {
          return Hex.removePrefix(a).length === 64
        }),
      )
      .query(({ input }): TransactionStatus => {
        if (transactionMempool.contains(input)) {
          return 'Soft commited'
        } else if (transactionRepository.contains(input)) {
          return 'Commited'
        }

        return 'Not found'
      }),
  })
}
