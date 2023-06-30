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
  const [status, setStatus] = useState<TransactionGetStatusOutput | undefined>(
    undefined,
  )
  trpc.transactions.getStatus.useQuery(Hex(props.hash), {
    onSuccess: (data) => {
      setStatus(data)
    },
  })

  return (
    <>
      {status ? (
        <div className="text-xl">
          <div>
            <span className="text-accent-foreground/50">
              Transaction Hash:{' '}
            </span>
            <span>{props.hash}</span>
          </div>

          <div>
            <span className="text-accent-foreground/50">Status: </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>{status}</TooltipTrigger>
                <TooltipContent>
                  <p>{getTooltipContent(status)}</p>
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

function getTooltipContent(status: TransactionGetStatusOutput): string {
  switch (status) {
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
