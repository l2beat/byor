'use client'

import { useState } from 'react'

import { trpc } from '@/lib/trpc'
import { GenericTransactionList, ListState } from './GenericTransactionList'
import { getQueryKey } from '@trpc/react-query'

const PAGINATION_SIZE = 25

export function CommitedTransactionList() {
  const [state, setState] = useState<ListState>({
    pageNum: 0,
    isLoading: true,
    txs: [],
  })

  trpc.transactions.getRange.useQuery(
    // NOTE(radomski): Fetch plus one to know if there exists a next page
    {
      start: state.pageNum * PAGINATION_SIZE,
      end: (state.pageNum + 1) * PAGINATION_SIZE + 1,
    },
    {
      trpc: { ssr: false },
      onSuccess: (data) => { setState({...state, isLoading: false, txs: data})}
    },
  )

  return (
    <GenericTransactionList title={"L1 Commited transactions"} state={state} setState={setState} />
  )
}
