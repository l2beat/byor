import { localNetwork } from '@byor/shared'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { goerli } from 'viem/chains'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'

import { CommittedTransactionList } from '@/components/CommittedTransactionList'
import { MempoolTransactionList } from '@/components/MempoolTransactionList'
import { Overview } from '@/components/Overview'
import { StateExplorer } from '@/components/StateExplorer'
import { Wallet } from '@/components/Wallet'

import { Navbar } from '../components/Navbar'
import { Toaster } from '../components/ui/toaster'

const chains = [process.env.NODE_ENV === 'production' ? goerli : localNetwork]
const projectId = '171b81f6da969b561d747dba97534b30'
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export default function Home() {
  console.log('into home, ', Date.now())

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <main className="pb-6">
          <Navbar />
          <Overview />
          <Wallet />
          <StateExplorer />
          <MempoolTransactionList />
          <CommittedTransactionList />
          <Toaster />
        </main>
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
