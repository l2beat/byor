'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NextRouter, useRouter } from 'next/router'
import { Dispatch, SetStateAction } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { formatTimeDifferenceFromNow } from '../utils/formatTimeDifferenceFromNow'
import { setExplorerInput } from './StateExplorer'

interface ListTransaction {
  hash: string
  from: string
  to: string
  value: string
  date: number
}

export interface ListState {
  pageNum: number
  isLoading: boolean
  txs: ListTransaction[]
}

export const PAGINATION_SIZE = 25

interface Props {
  state: ListState
  setState: Dispatch<SetStateAction<ListState>>
  title: string
}

export function GenericTransactionList({ title, state, setState }: Props) {
  return (
    <div className="container sm:px-8 px-2 items-center flex bg-zinc-800 rounded-xl mt-10 column flex-wrap">
      <GenericTransactionListInner
        title={title}
        state={state}
        setState={setState}
      />
    </div>
  )
}

function GenericTransactionListInner({ title, state, setState }: Props) {
  const router = useRouter()

  if (state.isLoading) {
    return (
      <span className="basis-full text-center text-xl font-bold">
        Transactions are loading...
      </span>
    )
  }

  return (
    <>
      <div className="grid grid-cols-12 basis-full justify-center items-center text-xl mb-6 mt-2 font-semibold">
        <span className="text-center col-span-4 col-start-5">{title}</span>
        <div className="col-start-10 col-span-3 sm:col-start-11 sm:col-span-2 lg:col-start-12 lg:col-span-1 grid grid-cols-3">
          {state.pageNum !== 0 && (
            <Button
              variant={'secondary'}
              className="px-0"
              onClick={() =>
                setState({
                  ...state,
                  isLoading: true,
                  pageNum: state.pageNum - 1,
                })
              }
            >
              <ChevronLeft size={18} />
            </Button>
          )}
          <Button className="col-start-2">{state.pageNum + 1}</Button>
          {state.txs.length / PAGINATION_SIZE > 1 && (
            <Button
              variant={'secondary'}
              className="px-0"
              onClick={() =>
                setState({
                  ...state,
                  isLoading: true,
                  pageNum: state.pageNum + 1,
                })
              }
            >
              <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </div>
      <div className="basis-full grid grid-cols-5 gap-4 text-xl">
        <span>Hash</span>
        <span>From</span>
        <span>To</span>
        <span>Value</span>
        <span>Date</span>
      </div>
      <Separator />
      {state.txs.length === 0 && (
        <span className="basis-full text-center text-xl my-4 font-semibold">
          Empty...
        </span>
      )}
      {state.txs.slice(0, PAGINATION_SIZE).map((tx, iter) => {
        return (
          <div
            key={iter}
            className="basis-full max-w-full grid grid-cols-5 gap-4"
          >
            <OpenInExplorer router={router} input={tx.hash}>
              <div className="text-gray-400 truncate sm:max-w-[12rem]">
                {tx.hash}
              </div>
            </OpenInExplorer>
            <OpenInExplorer router={router} input={tx.from}>
              <div className="text-gray-400 truncate">
                {minimizeAddress(tx.from)}
              </div>
            </OpenInExplorer>
            <OpenInExplorer router={router} input={tx.to}>
              <div className="text-gray-400 truncate">
                {minimizeAddress(tx.to)}
              </div>
            </OpenInExplorer>
            <div className="text-gray-400">{tx.value}</div>
            <div className="text-gray-400 sm:max-w-none truncate">
              {formatTimeDifferenceFromNow(tx.date)}
            </div>
          </div>
        )
      })}
    </>
  )
}

function OpenInExplorer({
  children,
  input,
  router,
}: {
  children: JSX.Element
  input: string
  router: NextRouter
}): JSX.Element {
  return (
    <Button
      variant="link"
      className="mr-auto max-w-full col-span-1 items-start p-0 h-0"
      onClick={() => setExplorerInput(router, input)}
    >
      {children}
    </Button>
  )
}

function minimizeAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(address.length - 8)}`
}
