import { trpc } from '@/lib/trpc'
import '@/styles/globals.css'

import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default trpc.withTRPC(App)
