'use client'

import { EthereumAddress } from '@byor/shared'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'

import { trpc } from '@/lib/trpc'

interface WalletAccountProps {
  address: string
}

export function Wallet() {
  const { address, status } = useAccount()

  return (
    <div className="container flex border rounded mt-10 column flex-wrap">
      <div className="flex basis-full my-2">
        <div className="ml-auto">
          <Web3Button />
        </div>
      </div>
      {status === 'connected' ? (
        <div className="basis-full my-2">
          <WalletBalance address={address} />
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

function WalletBalance({ address }: WalletAccountProps) {
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
