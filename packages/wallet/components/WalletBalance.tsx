'use client'
import { EthereumAddress } from '@byor/shared'

import { trpc } from '@/lib/trpc'

interface WalletAccountProps {
  address: string
}

export default function WalletBalance({ address }: WalletAccountProps) {
  const acc = trpc.accounts.getState.useQuery(EthereumAddress(address), {
    trpc: { ssr: false },
  })

  return (
    <>
      {acc.isFetched ? (
        <div className="text-xl">
          <div>
            <span className="text-accent-foreground/50">Address: </span>
            <span>{acc.data?.address}</span>
          </div>

          <div>
            <span className="text-accent-foreground/50">Balance: </span>
            <span>{acc.data?.balance}</span>
          </div>

          <div>
            <span className="text-accent-foreground/50">Nonce: </span>
            <span>{acc.data?.nonce}</span>
          </div>
        </div>
      ) : (
        <div>
          <p>Loading...</p>
        </div>
      )}
    </>
  )
}
