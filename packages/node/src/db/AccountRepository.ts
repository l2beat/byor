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

export class AccountRepository extends BaseRepository {
  addOrUpdateMany(accounts: AccountRecord[]): void {
    const drizzle = this.drizzle()
    const internalAccounts = accounts.map((acc) => toInternalAccount(acc))

    drizzle.transaction((tx) => {
      internalAccounts.forEach((account) => {
        tx.insert(accountsSchema)
          .values(account)
          .onConflictDoUpdate({
            target: accountsSchema.address,
            set: { nonce: account.nonce, balance: account.balance },
          })
          .run()
      })
    })
  }

  getAll(): AccountRecord[] {
    const drizzle = this.drizzle()
    return drizzle
      .select()
      .from(accountsSchema)
      .all()
      .map((acc) => fromInternalAccount(acc))
  }

  getByAddressOrDefault(address: EthereumAddress): AccountRecord {
    const drizzle = this.drizzle()
    const res = drizzle
      .select()
      .from(accountsSchema)
      .where(eq(accountsSchema.address, address.toString()))
      .get()

    // NOTE(radomski): Even though the inffered type says
    // that it can not be undefined it can
    // eslint-disable-next-line
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

  deleteAll(): void {
    const drizzle = this.drizzle()
    drizzle.delete(accountsSchema).run()
  }

  getCount(): number {
    const drizzle = this.drizzle()
    return drizzle
      .select({ count: sql<number>`count(*)` })
      .from(accountsSchema)
      .get().count
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
