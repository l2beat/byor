'use client'

import { Dispatch, SetStateAction } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { copyToClipboard } from '@/utils/copyToClipboard'

import { formatTimeDifferenceFromNow } from '../utils/formatTimeDifferenceFromNow'

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
    <div className="container items-center flex bg-zinc-800 rounded-xl mt-10 column flex-wrap">
      <GenericTransactionListInner
        title={title}
        state={state}
        setState={setState}
      />
    </div>
  )
}

function GenericTransactionListInner({ title, state, setState }: Props) {
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
        <div className="col-start-12 grid grid-cols-3">
          {state.pageNum !== 0 && (
            <Button
              variant={'secondary'}
              onClick={() =>
                setState({
                  ...state,
                  isLoading: true,
                  pageNum: state.pageNum - 1,
                })
              }
            >
              {state.pageNum}
            </Button>
          )}
          <Button className="col-start-2">{state.pageNum + 1}</Button>
          {state.txs.length / PAGINATION_SIZE > 1 && (
            <Button
              variant={'secondary'}
              onClick={() =>
                setState({
                  ...state,
                  isLoading: true,
                  pageNum: state.pageNum + 1,
                })
              }
            >
              {state.pageNum + 2}
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
          <div key={iter} className="basis-full grid grid-cols-5 gap-4">
            <Copyable toCopy={tx.hash}>
              <span className="text-gray-400 truncate max-w-[12rem]">{tx.hash}</span>
            </Copyable>
            <Copyable toCopy={tx.from}>
              <span className="text-gray-400">{minimizeAddress(tx.from)}</span>
            </Copyable>
            <Copyable toCopy={tx.to}>
              <span className="text-gray-400">{minimizeAddress(tx.to)}</span>
            </Copyable>
            <span className="text-gray-400">{tx.value}</span>
            <span className="text-gray-400">{formatTimeDifferenceFromNow(tx.date)}</span>
          </div>
        )
      })}
    </>
  )
}

function Copyable({
  children,
  toCopy,
}: {
  children: JSX.Element
  toCopy: string
}): JSX.Element {
  return (
    <Button
      variant="link"
      className="mr-auto justify-left items-start p-0 h-0"
      onClick={() => copyToClipboard(toCopy)}
    >
      {children}
    </Button>
  )
}

function minimizeAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(address.length - 8)}`
}
