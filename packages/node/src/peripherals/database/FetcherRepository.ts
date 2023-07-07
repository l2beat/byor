import { assert } from '@byor/shared'
import { eq, InferModel } from 'drizzle-orm'

import { ChainContractCreationTime } from './getContractCreationTime'
import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'
import { fetcherSchema } from './shared/schema'

type InternalFetcherRecord = InferModel<typeof fetcherSchema>

export interface FetcherRecord {
  chainId: number
  lastFetchedBlock: bigint
}

/* eslint-disable @typescript-eslint/require-await */
export class FetcherRepository extends BaseRepository {
  constructor(
    database: Database,
    private readonly creationPair: ChainContractCreationTime,
  ) {
    super(database)
  }

  async addOrUpdate(fetcher: FetcherRecord): Promise<void> {
    const drizzle = this.drizzle()
    const internalFetcher = toInternalFetcher(fetcher)

    await drizzle.transaction(async (tx) => {
      await tx
        .insert(fetcherSchema)
        .values(internalFetcher)
        .onConflictDoUpdate({
          target: fetcherSchema.chainId,
          set: { lastFetchedBlock: internalFetcher.lastFetchedBlock },
        })
    })
  }

  async getAll(): Promise<FetcherRecord[]> {
    const drizzle = this.drizzle()
    const values = await drizzle.select().from(fetcherSchema)
    return values.map(fromInternalFetcher)
  }

  async getByChainIdOrDefault(chainId: number): Promise<FetcherRecord> {
    const drizzle = this.drizzle()
    const [res] = await drizzle
      .select()
      .from(fetcherSchema)
      .where(eq(fetcherSchema.chainId, chainId))
      .limit(1)

    if (!res) {
      if (chainId !== this.creationPair.chainId) {
        this.database
          .getLogger()
          .for(this)
          .warn(
            'chainId received as parameter does not match with the one received in the constructor',
            { paramChainId: chainId, ctorChainId: this.creationPair.chainId },
          )

        return {
          chainId,
          lastFetchedBlock: -1n,
        }
      }

      return {
        chainId: this.creationPair.chainId,
        lastFetchedBlock: BigInt(this.creationPair.contractCreatedAtBlock - 1),
      }
    }
    return fromInternalFetcher(res)
  }

  async deleteAll(): Promise<void> {
    const drizzle = this.drizzle()
    await drizzle.delete(fetcherSchema)
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
