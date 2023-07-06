'use client'

import { useContext } from 'react'

import { AccountContext } from './AccountContext'

export default function AccountBalance() {
  const acc = useContext(AccountContext)

  return (
    <div className="text-xl">
      <div>
        <span>Address: </span>
        <span className="text-gray-400">{acc.address}</span>
      </div>

      <div>
        <span>Balance: </span>
        <span className="text-gray-400">{acc.balance}</span>
      </div>

      <div>
        <span>Nonce: </span>
        <span className="text-gray-400">{acc.nonce}</span>
      </div>
    </div>
  )
}
