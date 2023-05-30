import { assert } from '@byor/shared'
import { eq, InferModel } from 'drizzle-orm'

import { BaseRepository } from './BaseRepository'
import { fetcherSchema } from './schema'

type InternalFetcherRecord = InferModel<typeof fetcherSchema>

export interface FetcherRecord {
  chainId: number
  lastFetchedBlock: bigint
}

export class FetcherRepository extends BaseRepository {
  addOrUpdate(fetcher: FetcherRecord): void {
    const drizzle = this.drizzle()
    const internalFetcher = toInternalFetcher(fetcher)

    drizzle.transaction((tx) => {
      tx.insert(fetcherSchema)
        .values(internalFetcher)
        .onConflictDoUpdate({
          target: fetcherSchema.chainId,
          set: { lastFetchedBlock: internalFetcher.lastFetchedBlock },
        })
        .run()
    })
  }

  getAll(): FetcherRecord[] {
    const drizzle = this.drizzle()
    return drizzle
      .select()
      .from(fetcherSchema)
      .all()
      .map((fetcher) => fromInternalFetcher(fetcher))
  }

  getByChainIdOrDefault(chainId: number): FetcherRecord {
    const drizzle = this.drizzle()
    const res = drizzle
      .select()
      .from(fetcherSchema)
      .where(eq(fetcherSchema.chainId, chainId))
      .get()

    // NOTE(radomski): Even though the inffered type says
    // that it can not be undefined it can
    // eslint-disable-next-line
    if (!res) {
      const res = {
        chainId,
        lastFetchedBlock: 0n,
      }

      return res
    }
    return fromInternalFetcher(res)
  }

  deleteAll(): void {
    const drizzle = this.drizzle()
    drizzle.delete(fetcherSchema).run()
  }
}

function toInternalFetcher(fetcher: FetcherRecord): InternalFetcherRecord {
  // WARNING(radomski): This can fail very badly if the value represented
  // by 'BigInt' is so big that the floating point nature of 'number'
  // causes it to lose precision. This can happen when the value is
  // bigger then Number.MAX_SAFE_INTEGER. drizzle-orm should support
  // passing values as bigints into the query but it currently does
  // not (see https://github.com/drizzle-team/drizzle-orm/issues/611).

  assert(
    fetcher.lastFetchedBlock <= BigInt(Number.MAX_SAFE_INTEGER),
    'The bigint value is bigger than the biggest safely representable value',
  )

  return {
    chainId: fetcher.chainId,
    lastFetchedBlock: parseInt(fetcher.lastFetchedBlock.toString(), 10),
  }
}

function fromInternalFetcher(fetcher: InternalFetcherRecord): FetcherRecord {
  return {
    chainId: fetcher.chainId,
    lastFetchedBlock: BigInt(fetcher.lastFetchedBlock),
  }
}
