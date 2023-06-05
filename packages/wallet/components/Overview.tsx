import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'

interface StatisticProps {
  description: string
  value: string
}

function Statistic({ description, value }: StatisticProps): JSX.Element {
  return (
    <div className="font-sens-serif uppercase py-1">
      <div>{`${description}`}</div>
      <h1 className="text-2xl">{`${value}`}</h1>
    </div>
  )
}

function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const year = date.getUTCFullYear()
  const month = months[date.getUTCMonth()]
  const day = `0${date.getUTCDate()}`.slice(-2)
  const hours = `0${date.getUTCHours()}`.slice(-2)
  const minutes = `0${date.getUTCMinutes()}`.slice(-2)
  const seconds = `0${date.getUTCSeconds()}`.slice(-2)

  return `${year} ${month} ${day} ${hours}:${minutes}:${seconds} (UTC)`
}

export function Overview(): JSX.Element {
  const res = trpc.statistics.getOverview.useQuery()

  if (!res.data) {
    return <h1>Loading...</h1>
  }

  const { data } = res

  return (
    <div className="container flex border rounded mt-10 justify-around">
      <div>
        <Statistic
          description={'L2 Transactions'}
          value={`${data.l2TransactionCount}`}
        />
        <Separator />
        <Statistic
          description={'L1 Last Batch Upload'}
          value={`${formatUnixTimestamp(data.l1LastBatchUploadTimestamp)}`}
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
