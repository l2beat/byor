import Link from 'next/link'
import { L2BeatLogo } from './L2BeatLogo'
import { Github } from 'lucide-react'

export function Navbar(): JSX.Element {
  return (
    <div className="container flex font-semibold py-2 items-end px-0">
      <span className="text-4xl italic">Build Your Own Rollup</span>
      <span className="text-sm pl-2">Made By</span>
      <Link href="https://l2beat.com">
        <div className="pl-2">
          <L2BeatLogo />
        </div>
      </Link>
      <div className="flex ml-auto px-2">
        <Link href="https://github.com/l2beat/byor">
        <Github />
        </Link>
      </div>
    </div>
  )
}
