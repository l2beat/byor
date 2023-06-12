'use client'

import { EthereumAddress } from '@byor/shared'
import { Web3Button } from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { trpc } from '@/lib/trpc'

interface WalletAccountProps {
  address: string | undefined
}

export function Wallet() {
  const { address, isConnected } = useAccount()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(isConnected)
  }, [isConnected])

  return (
    <div className="container flex border rounded mt-10 column flex-wrap">
      <div className="flex basis-full my-2">
        <div className="ml-auto">
          <Web3Button />
        </div>
      </div>
      {ready ? (
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
  let acc = undefined
  if (address) {
    acc = trpc.accounts.getState.useQuery(EthereumAddress(address), {
      trpc: { ssr: false },
    })
  }

  return (
    <>
      {acc?.isFetched ? (
        <div>
          <div>
            <span className="text-1xl text-accent-foreground/50">
              Address:{' '}
            </span>
            <span className="text-1xl">{acc.data?.address}</span>
          </div>

          <div>
            <span className="text-1xl text-accent-foreground/50">
              Balance:{' '}
            </span>
            <span className="text-1xl">{acc.data?.balance}</span>
          </div>

          <div>
            <span className="text-1xl text-accent-foreground/50">Nonce: </span>
            <span className="text-1xl">{acc.data?.nonce}</span>
          </div>
        </div>
      ) : (
        <div>
          <p>{'Loading...'}</p>
        </div>
      )}
    </>
  )
}
