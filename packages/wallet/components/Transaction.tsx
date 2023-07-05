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
          <div>
            <span>Transaction Hash: </span>
            <span className="text-gray-400">{props.hash}</span>
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
                    <div>
                      <span>{'From: '}</span>
                      <span className="text-gray-400">
                        {' '}
                        {tx.transaction.from}{' '}
                      </span>
                    </div>
                    <div>
                      <span>{'To: '}</span>
                      <span className="text-gray-400">
                        {' '}
                        {tx.transaction.to}{' '}
                      </span>
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
