import { createContext } from 'react'

export interface AccountState {
  address: string
  balance: string
  nonce: string
}

export const AccountContext = createContext<AccountState>({
  address: '',
  balance: '',
  nonce: '',
})
