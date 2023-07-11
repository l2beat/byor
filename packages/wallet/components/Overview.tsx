'use client'

import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'

import { formatUnixTimestampMsOrDefault } from '../utils/formatUnixTimestamp'

interface StatisticProps {
  description: string
  value: string
  className?: string
}

export function Overview(): JSX.Element {
  const { data } = trpc.statistics.getOverview.useQuery()

  if (!data) {
    return (
      <div className="container flex bg-zinc-800 rounded-xl mt-10 justify-around">
        <span className="basis-full text-center text-xl font-bold">
          Overview is loading...
        </span>
      </div>
    )
  }

  return (
    <div className="container grid grid-cols-2 bg-zinc-800 rounded-xl mt-10 justify-around">
      <Statistic
        className="col-span-1"
        description={'L2 Transactions'}
        value={`${data.l2TransactionCount}`}
      />
      <Statistic
        className="col-span-1"
        description={'L1 Last Batch Upload'}
        value={`${formatUnixTimestampMsOrDefault(
          data.l1LastBatchUploadTimestamp,
          'No transactions found',
        )}`}
      />
      <Separator className="col-span-2" />
      <Statistic
        className="col-span-1"
        description={'Daily Transaction Count'}
        value={`${data.l2DailyTransactionCount}`}
      />
      <Statistic
        className="col-span-1"
        description={'Daily Token Volume'}
        value={`${data.l2DailyTokenVolume}`}
      />
    </div>
  )
}

function Statistic({
  description,
  value,
  className,
}: StatisticProps): JSX.Element {
  return (
    <div
      className={`font-sens-serif uppercase py-1 ${className ? className : ''}`}
    >
      <div className="text-gray-600">{`${description}`}</div>
      <div className="text-2xl">{`${value}`}</div>
    </div>
  )
}
