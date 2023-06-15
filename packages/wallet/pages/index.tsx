import { AccountExplorer } from '@/components/AccountExplorer'
import { Overview } from '@/components/Overview'
import { Wallet } from '@/components/Wallet'

import { Navbar } from '../components/Navbar'
import { Toaster } from '../components/ui/toaster'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Overview />
      <Wallet />
      <AccountExplorer />
      <Toaster />
    </main>
  )
}
