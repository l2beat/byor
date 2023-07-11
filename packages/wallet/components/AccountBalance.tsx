'use client'

import { useContext } from 'react'

import { AccountContext } from './AccountContext'

export default function AccountBalance() {
  const acc = useContext(AccountContext)

  return (
    <div className="text-xl max-w-full">
      <div className="flex max-w-full">
        <div>Address:</div>
        <div className="pl-2 text-gray-400 grow truncate">{acc.address}</div>
      </div>

      <div className="flex max-w-full">
        <div>Balance:</div>
        <div className="pl-2 text-gray-400 grow truncate">{acc.balance}</div>
      </div>

      <div className="flex max-w-full">
        <div>Nonce:</div>
        <div className="pl-2 text-gray-400 grow truncate">{acc.nonce}</div>
      </div>
    </div>
  )
}
