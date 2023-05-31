import { Separator } from '@/components/ui/separator'

function Statistic({ description, value }): JSX.Element {
  return (
    <div className="font-sens-serif uppercase py-1">
      <div>{`${description}`}</div>
      <h1 className="text-2xl">{`${value}`}</h1>
    </div>
  )
}

export function Overview({ l2TransactionCount }): JSX.Element {
  return (
    <div className="container flex border rounded p-6 justify-around">
      <div>
        <Statistic description={'L2 Transactions'} value={`${l2TransactionCount}`} />
        <Separator />
        <Statistic
          description={'L1 Last Batch Upload'}
          value={'13:43:15 18.05.2023'}
        />
      </div>
      <Separator orientation="vertical" />
      <div>
        <Statistic description={'Daily Transaction Count'} value={'175'} />
        <Separator />
        <Statistic description={'Daily Token Volume'} value={'23403'} />
      </div>
    </div>
  )
}
