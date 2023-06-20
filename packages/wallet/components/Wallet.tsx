'use client'

import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'

import { Account } from './Account'
import { FaucetPrivateKey } from './FaucetPrivateKey'
import { TransactionModal } from './TransactionModal'
import AccountBalance from './WalletBalance'

export function Wallet() {
  const { address, status } = useAccount()

  return (
    <div className="container flex border rounded mt-10 column flex-wrap">
      <div className="flex basis-full my-2">
        {status === 'connected' ? (
          <Account address={address}>
            <TransactionModal />
            <div className="basis-full my-2">
              <AccountBalance />
            </div>
          </Account>
        ) : (
          <FaucetPrivateKey />
        )}
        <div className="ml-auto">
          <Web3Button />
        </div>
      </div>
    </div>
  )
}
