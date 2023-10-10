'use client'

import { useEffect, useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'

import { Account } from './Account'
import AccountBalance from './AccountBalance'
import { FaucetPrivateKey } from './FaucetPrivateKey'
import { TransactionModal } from './TransactionModal'
import { ToastAction } from './ui/toast'
import { useToast } from './ui/use-toast'

export function Wallet() {
  // WalletConnect has some issues with SSR and tries to render things on the server
  // causing hydration errors on the client, for more information see:
  // https://github.com/WalletConnect/web3modal/issues/196
  const [isSSR, setIsSSR] = useState(true)

  const { chain, chains } = useNetwork()
  const [walletReady, setWalletReady] = useState<boolean>(false)
  const { switchNetwork } = useSwitchNetwork({
    onSuccess: () => setWalletReady(true),
  })
  const { toast } = useToast()
  const { address, status } = useAccount({
    onConnect: () => setWalletReady(true),
  })

  useEffect(() => {
    setIsSSR(false)
    const connected = status === 'connected'
    const wrongChain = chain && chains.length === 1 && chain.id !== chains[0].id
    if (connected && wrongChain) {
      setWalletReady(false)
      toast({
        variant: 'destructive',
        title: 'Wallet on the wrong chain',
        description: `In your wallet you are connected to chain "${chain.name}" but you should be connected to "${chains[0].name}"`,
        action: (
          <ToastAction
            disabled={!switchNetwork}
            altText="Switch chain"
            onClick={() => {
              if (switchNetwork && chains.length === 1) {
                switchNetwork(chains[0].id)
              }
            }}
          >
            Switch chain
          </ToastAction>
        ),
      })
    }
    // eslint-disable-next-line
  }, [chain, chains, status])

  return (
    <div className="container flex flex-wrap bg-zinc-800 rounded-xl mt-10">
      {!isSSR && (
        <>
          <div className="flex basis-full mt-2">
            {status === 'connected' && (
              <Account address={address}>
                <>{walletReady && <TransactionModal />}</>
              </Account>
            )}
          </div>
          <div className="basis-full max-w-full">
            {status === 'connected' ? (
              <Account address={address}>
                <div className="max-w-full my-2">
                  <AccountBalance />
                </div>
              </Account>
            ) : (
              <div className="max-w-full my-2">
                <FaucetPrivateKey />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
