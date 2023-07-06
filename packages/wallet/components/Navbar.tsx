import Link from 'next/link'
import { L2BeatLogo } from './L2BeatLogo'

export function Navbar(): JSX.Element {
  return (
    <div className="container flex font-semibold py-2 items-end">
      <span className="text-4xl italic">Build Your Own Rollup</span>
      <span className="text-sm pl-2">Made By</span>
      <Link href="https://l2beat.com">
        <div className="pl-2">
          <L2BeatLogo />
        </div>
      </Link>
    </div>
  )
}
