import { assert, EthereumAddress, Unsigned64 } from '@byor/shared'
import { eq, InferModel, sql } from 'drizzle-orm'

import { BaseRepository } from './BaseRepository'
import { accountsSchema } from './schema'

type InternalAccountRecord = InferModel<typeof accountsSchema>

export interface AccountRecord {
  address: EthereumAddress
  balance: Unsigned64
  nonce: Unsigned64
}

/* eslint-disable @typescript-eslint/require-await */
export class AccountRepository extends BaseRepository {
  async addOrUpdateMany(accounts: AccountRecord[]): Promise<void> {
    const drizzle = this.drizzle()
    const internalAccounts = accounts.map((acc) => toInternalAccount(acc))

    await drizzle.transaction(async (tx) => {
      for (const account of internalAccounts) {
        await tx
          .insert(accountsSchema)
          .values(account)
          .onConflictDoUpdate({
            target: accountsSchema.address,
            set: { nonce: account.nonce, balance: account.balance },
          })
      }
    })
  }

  async getAll(): Promise<AccountRecord[]> {
    const drizzle = this.drizzle()
    const values = await drizzle.select().from(accountsSchema)
    return values.map(fromInternalAccount)
  }

  async getByAddressOrDefault(
    address: EthereumAddress,
  ): Promise<AccountRecord> {
    const drizzle = this.drizzle()
    const [res] = await drizzle
      .select()
      .from(accountsSchema)
      .where(eq(accountsSchema.address, address.toString()))
      .limit(1)

    if (!res) {
      const res = {
        address,
        balance: Unsigned64(0n),
        nonce: Unsigned64(0n),
      }

      return res
    }
    return fromInternalAccount(res)
  }

  async deleteAll(): Promise<void> {
    const drizzle = this.drizzle()
    await drizzle.delete(accountsSchema)
  }

  async getCount(): Promise<number> {
    const drizzle = this.drizzle()
    const result = await drizzle
      .select({ count: sql<string>`count(*)` })
      .from(accountsSchema)
    return parseInt(result[0]?.count ?? '0')
  }
}

function toInternalAccount(acc: AccountRecord): InternalAccountRecord {
  // WARNING(radomski): This can fail very badly if the value represented
  // by 'BigInt' is so big that the floating point nature of 'number'
  // causes it to lose precision. This can happen when the value is
  // bigger then Number.MAX_SAFE_INTEGER. drizzle-orm should support
  // passing values as bigints into the query but it currently does
  // not (see https://github.com/drizzle-team/drizzle-orm/issues/611).
  // For real applications where the upper parts of the 64bit values
  // are needed please consider removing drizzle-orm!

  assert(
    acc.balance.valueOf() <= BigInt(Number.MAX_SAFE_INTEGER),
    'The Unsigned64 value is bigger than the biggest safely representable value',
  )
  assert(
    acc.nonce.valueOf() <= BigInt(Number.MAX_SAFE_INTEGER),
    'The Unsigned64 value is bigger than the biggest safely representable value',
  )

  return {
    address: acc.address.toString(),
    balance: parseInt(acc.balance.toString(), 10),
    nonce: parseInt(acc.nonce.toString(), 10),
  }
}

function fromInternalAccount(acc: InternalAccountRecord): AccountRecord {
  return {
    address: EthereumAddress(acc.address),
    balance: Unsigned64(acc.balance),
    nonce: Unsigned64(acc.nonce),
  }
}
