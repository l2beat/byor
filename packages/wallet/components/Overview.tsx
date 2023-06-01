import { EthereumAddress } from '@byor/shared/src/types';
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc';

function Statistic({ description, value }): JSX.Element {
  return (
    <div className="font-sens-serif uppercase py-1">
      <div>{`${description}`}</div>
      <h1 className="text-2xl">{`${value}`}</h1>
    </div>
  )
}

export function Overview(): JSX.Element {
    const res = trpc.accounts.getState.useQuery("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    // const res = trpc.accounts.getState.useQuery("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")

    if(res.status !== 'success') {
        return (<h1>Loading...</h1>);
    }

    const { data } = res;
    // const data = {
    // balance: 10,
    // }

  return (
    <div className="container flex border rounded p-6 justify-around">
      <div>
        <Statistic description={'L2 Transactions'} value={`${data.balance}`} />
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
