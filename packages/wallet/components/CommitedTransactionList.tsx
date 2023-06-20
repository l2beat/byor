'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'
import { copyToClipboard } from '@/utils/copyToClipboard'

import { formatTimeDifferenceFromNow } from '../utils/formatTimeDifferenceFromNow'

const PAGINATION_SIZE = 25

export function CommitedTransactionList() {
  return (
    <div className="container items-center flex border rounded mt-10 column flex-wrap">
        <CommitedTransactionListInner />
    </div>
  )
}

function CommitedTransactionListInner() {
  const [pageNum, setPageNum] = useState(0)

  const txs = trpc.transactions.getRange.useQuery(
    // NOTE(radomski): Fetch plus one to know if there exists a next page
    { start: pageNum * PAGINATION_SIZE, end: ((pageNum + 1) * PAGINATION_SIZE) + 1 },
    {
      trpc: { ssr: false },
    },
  )

  if (txs.status !== 'success') {
    return <span className="basis-full text-center text-xl font-bold">Transactions are loading...</span>
  }

  return (
    <>
      <div className="grid grid-cols-12 basis-full justify-center items-center text-xl mb-6 mt-2 font-semibold">
        <span className="text-center col-span-4 col-start-5">
          L1 Commited transactions
        </span>
        <div className="col-start-12 grid grid-cols-3">
          {pageNum !== 0 && (
            <Button
              variant={'secondary'}
              onClick={() => setPageNum(pageNum - 1)}
            >
              {pageNum}
            </Button>
          )}
          <Button className="col-start-2">{pageNum + 1}</Button>
          {txs.data.length / PAGINATION_SIZE > 1 && (
            <Button
              variant={'secondary'}
              onClick={() => setPageNum(pageNum + 1)}
            >
              {pageNum + 2}
            </Button>
          )}
        </div>
      </div>
      <div className="basis-full grid grid-cols-4 gap-4 text-xl">
        <span>Hash</span>
        <span>From</span>
        <span>To</span>
        <span>Date</span>
      </div>
      <Separator />
      {txs.data.slice(0, PAGINATION_SIZE).map((tx, iter) => {
        return (
          <div key={iter} className="basis-full grid grid-cols-4 gap-4">
            {makeElementCopyable(
              <span className="truncate max-w-[12rem]">{tx.hash}</span>,
              tx.hash,
            )}
            {makeElementCopyable(
              <span>{minimizeAddress(tx.from)}</span>,
              tx.from,
            )}
            {makeElementCopyable(<span>{minimizeAddress(tx.to)}</span>, tx.to)}
            <span>{formatTimeDifferenceFromNow(tx.date)}</span>
          </div>
        )
      })}
    </>
  )
}

function makeElementCopyable(
  element: JSX.Element,
  toCopy: string,
): JSX.Element {
  return (
    <Button
      variant="link"
      className="mr-auto justify-left items-start p-0 h-0"
      onClick={() => copyToClipboard(toCopy)}
    >
      {element}
    </Button>
  )
}

function minimizeAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(address.length - 8)}`
}
