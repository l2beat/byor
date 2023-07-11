'use client'

import { Hex } from '@byor/shared'
import { useState } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TransactionGetStatusOutput, trpc } from '@/lib/trpc'

interface Props {
  hash: string
}

export default function Transaction(props: Props) {
  const [tx, setTx] = useState<TransactionGetStatusOutput | undefined>(
    undefined,
  )
  trpc.transactions.getStatus.useQuery(Hex(props.hash), {
    onSuccess: (data) => {
      setTx(data)
    },
  })

  return (
    <>
      {tx ? (
        <div className="text-xl">
          <div className="flex max-w-full">
            <div>
              <span className="whitespace-nowrap">{'Transaction Hash:'}</span>
            </div>
            <div className="pl-2 text-gray-400 grow truncate">{props.hash}</div>
          </div>

          <div>
            <span>Status: </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-gray-400">
                  {tx.status}
                </TooltipTrigger>
                {tx.status !== 'Not found' && (
                  <div>
                    <div className="flex max-w-full">
                      <div>From:</div>
                      <div className="pl-2 text-gray-400 grow truncate">
                        {tx.transaction.from}
                      </div>
                    </div>
                    <div className="flex max-w-full">
                      <div>To:</div>
                      <div className="pl-2 text-gray-400 grow truncate">
                        {tx.transaction.to}
                      </div>
                    </div>
                    <div>
                      <span>{'Value: '}</span>
                      <span className="text-gray-400">
                        {' '}
                        {tx.transaction.value}{' '}
                      </span>
                    </div>
                    <div>
                      <span>{'Nonce: '}</span>
                      <span className="text-gray-400">
                        {' '}
                        {tx.transaction.nonce}{' '}
                      </span>
                    </div>
                  </div>
                )}
                <TooltipContent>
                  <p className="text-gray-400">{getTooltipContent(tx)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </>
  )
}

function getTooltipContent(tx: TransactionGetStatusOutput): string {
  switch (tx.status) {
    case 'Committed': {
      return 'Transaction data now part of the L1 chain'
    }
    case 'Soft committed': {
      return 'Transaction is in the mempool waiting to be submitted to the L1'
    }
    case 'Not found': {
      return 'Transaction has not been found in the mempool of the chosen node nor L1 chain'
    }
  }
}
