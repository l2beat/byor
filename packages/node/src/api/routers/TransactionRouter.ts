import { assert, branded, deserializeBatch, Hex } from '@byor/shared'
import { TRPCError } from '@trpc/server'
import { zip } from 'lodash'
import { z } from 'zod'

import { TransactionRepository } from '../../db/TransactionRepository'
import { Mempool } from '../../peripherals/mempool/Mempool'
import { publicProcedure, router } from '../trpc'

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
    getRange: publicProcedure
      .input(
        z
          .object({ start: z.number().gte(0), end: z.number().gte(0) })
          .refine((i) => {
            return i.end >= i.start
          }),
      )
      .query(({ input }) => {
        return transactionRepository
          .getRange(input.start, input.end)
          .map((tx) => {
            return {
              // NOTE(radomski): We know that it won't be undefined
              // because hashes are always stored in the database
              /* eslint-disable-next-line */
              hash: tx.hash!.toString(),
              from: tx.from.toString(),
              to: tx.to.toString(),
              value: tx.value.toString(),
              date: tx.l1SubmittedDate.getTime(),
            }
          })
      }),
    getMempoolRange: publicProcedure
      .input(
        z
          .object({ start: z.number().gte(0), end: z.number().gte(0) })
          .refine((i) => {
            return i.end >= i.start
          }),
      )
      .query(({ input }) => {
        const txs = transactionMempool.getTransactionsInPool()
        const timestamps = transactionMempool.getTransactionsTimestamps()
        assert(
          txs.length === timestamps.length,
          'Invalid mempool state, dropping everything',
        )

        // NOTE(radomski): We know that it won't be undefined
        // because of the assert at the beginning of this function
        /* eslint-disable */
        return zip(txs, timestamps)
          .slice(input.start, input.end)
          .map(([tx, timestamp]) => {
            return {
              hash: tx!.hash!.toString(),
              from: tx!.from.toString(),
              to: tx!.to.toString(),
              value: tx!.value.toString(),
              date: timestamp!,
            }
          })
        /* eslint-enable */
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
