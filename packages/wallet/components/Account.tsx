'use client'

import { EthereumAddress } from '@byor/shared'

import { trpc } from '@/lib/trpc'

import { AccountContext } from './AccountContext'

interface Props {
  children: string | JSX.Element | JSX.Element[]
  address: string
}

export function Account({ address, children }: Props) {
  const acc = trpc.accounts.getState.useQuery(EthereumAddress(address), {
    trpc: { ssr: false },
  })

  return acc.status === 'success' ? (
    <div>
      <AccountContext.Provider value={acc.data}>
        {children}
      </AccountContext.Provider>
    </div>
  ) : (
    <>Account is loading...</>
  )
}
