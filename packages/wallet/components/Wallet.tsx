'use client'

import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'

import { TransactionModal } from './TransactionModal'
import WalletBalance from './WalletBalance'

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
          <TransactionModal balance={address} />
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
