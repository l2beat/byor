import { Github } from 'lucide-react'
import Link from 'next/link'

import BYORIcon from './icons/BYORIcon'
import { L2BeatLogo } from './L2BeatLogo'

export function Navbar(): JSX.Element {
  return (
    <div className="container flex font-semibold py-2 items-start sm:items-end px-0">
      <BYORIcon className="h-16 w-16" />
      <div className="sm:flex sm:items-end">
        <span className="text-sm sm:pl-2">Made By</span>
        <Link href="https://l2beat.com">
          <div className="pl-2">
            <L2BeatLogo />
          </div>
        </Link>
      </div>

      <div className="flex self-start sm:self-auto ml-auto sm:px-2 sm:py-0 px-4 py-2">
        <Link href="https://github.com/l2beat/byor">
          <Github />
        </Link>
      </div>
    </div>
  )
}
