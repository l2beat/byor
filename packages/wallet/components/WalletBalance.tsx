'use client'

import { useContext } from 'react'

import { AccountContext } from './AccountContext'

export default function AccountBalance() {
  const acc = useContext(AccountContext)

  return (
    <div className="text-xl">
      <div>
        <span className="text-accent-foreground/50">Address: </span>
        <span>{acc.address}</span>
      </div>

      <div>
        <span className="text-accent-foreground/50">Balance: </span>
        <span>{acc.balance}</span>
      </div>

      <div>
        <span className="text-accent-foreground/50">Nonce: </span>
        <span>{acc.nonce}</span>
      </div>
    </div>
  )
}
