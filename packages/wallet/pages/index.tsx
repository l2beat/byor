import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { Overview } from '@/components/Overview'

import { Navbar } from '../components/Navbar'
import { trpc } from '../lib/trpc'
import { EthereumAddress } from '@/../shared/build';

interface Account {
    address: string;
    balance: string;
    nonce: string;
}

export default function Home({
    acc,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <main>
            <Navbar />
            <Overview/>
        </main>
    )
}
