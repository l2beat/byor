import { Overview } from '@/components/Overview'
import { StateExplorer } from '@/components/StateExplorer'
import { Wallet } from '@/components/Wallet'

import { Navbar } from '../components/Navbar'
import { Toaster } from '../components/ui/toaster'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Overview />
      <Wallet />
      <StateExplorer />
      <Toaster />
    </main>
  )
}
