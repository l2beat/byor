'use client'

import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'

import { formatUnixTimestampMsOrDefault } from '../utils/formatUnixTimestamp'

interface StatisticProps {
  description: string
  value: string
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
    <div className="container flex bg-zinc-800 rounded-xl mt-10 justify-around">
      <div>
        <Statistic
          description={'L2 Transactions'}
          value={`${data.l2TransactionCount}`}
        />
        <Separator />
        <Statistic
          description={'L1 Last Batch Upload'}
          value={`${formatUnixTimestampMsOrDefault(
            data.l1LastBatchUploadTimestamp,
            'No transactions found',
          )}`}
        />
      </div>
      <Separator orientation="vertical" />
      <div>
        <Statistic
          description={'Daily Transaction Count'}
          value={`${data.l2DailyTransactionCount}`}
        />
        <Separator />
        <Statistic
          description={'Daily Token Volume'}
          value={`${data.l2DailyTokenVolume}`}
        />
      </div>
    </div>
  )
}

function Statistic({ description, value }: StatisticProps): JSX.Element {
  return (
    <div className="font-sens-serif uppercase py-1">
      <div className="text-gray-600">{`${description}`}</div>
      <h1 className="text-2xl">{`${value}`}</h1>
    </div>
  )
}
