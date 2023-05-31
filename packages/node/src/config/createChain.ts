import { Chain } from 'viem/chains'

export function createChain(chainId: number, rpcUrl: string): Chain {
  const result = {
    id: chainId,
    name: 'BYOR Destination Net',
    network: 'byordestnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: [rpcUrl] },
      default: { http: [rpcUrl] },
    },
  } as const satisfies Chain

  return result
}
