import { EthereumAddress } from '@byor/shared/src/types';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc';
import { GetServerSidePropsContext } from 'next';

function Statistic({ description, value }): JSX.Element {
  return (
    <div className="font-sens-serif uppercase py-1">
      <div>{`${description}`}</div>
      <h1 className="text-2xl">{`${value}`}</h1>
    </div>
  )
}

export function Overview(): JSX.Element {
    const res = trpc.accounts.getState.useQuery("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

    if(!res.data) {
        return (<h1>Loading...</h1>);
    }

    const { data } = res;

  return (
    <div className="container flex border rounded p-6 justify-around">
      <div>
        <Statistic description={'L2 Transactions'} value={`${data.balance}`} />
        <Separator />
        <Statistic
          description={'L1 Last Batch Upload'}
          value={`${data.nonce}`}
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

/*
export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>,
) {
  const helpers = createServerSideHelpers({
    router: trpc,
    ctx: {},
  });
  const id = context.params?.id as string;
   * Prefetching the `post.byId` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
  await helpers.post.byId.prefetch({ id });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}
*/
