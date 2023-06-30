import { CommittedTransactionList } from '@/components/CommittedTransactionList'
import { MempoolTransactionList } from '@/components/MempoolTransactionList'
import { Overview } from '@/components/Overview'
import { StateExplorer } from '@/components/StateExplorer'
import { Wallet } from '@/components/Wallet'

import { Navbar } from '../components/Navbar'
import { Toaster } from '../components/ui/toaster'

export default function Home() {
  return (
    <main className="pb-6">
      <Navbar />
      <Overview />
      <Wallet />
      <StateExplorer />
      <MempoolTransactionList />
      <CommittedTransactionList />
      <Toaster />
    </main>
  )
}
