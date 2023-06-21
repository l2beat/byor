'use client'

import { Web3Button } from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { Account } from './Account'
import { FaucetPrivateKey } from './FaucetPrivateKey'
import { TransactionModal } from './TransactionModal'
import AccountBalance from './WalletBalance'

export function Wallet() {
  // WalletConnect has some issues with SSR and tries to render things on the server
  // causing hydration errors on the client, for more information see:
  // https://github.com/WalletConnect/web3modal/issues/196
  const [isSSR, setIsSSR] = useState(true)

  useEffect(() => {
    setIsSSR(false)
  }, [])
  const { address, status } = useAccount()

  return (
    <div className="container flex border rounded mt-10 column flex-wrap">
      {!isSSR && (
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
      )}
    </div>
  )
}
