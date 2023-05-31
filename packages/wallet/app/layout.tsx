import './globals.css'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'BYOR Wallet',
  description: 'Wallet for connecting with L2Beat\'s Build Your Own Rollup L2',
}

// NOTE(radomski): Next.js docs says it has to be the default export
// (https://nextjs.org/docs/app/api-reference/file-conventions/page)
// eslint-disable-next-line
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
