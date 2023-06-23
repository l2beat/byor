import { Chain, goerli } from 'viem/chains'

export function getChain(): Chain {
  if (process.env.NODE_ENV === 'production') {
    return goerli
  }

  return {
    id: 31337,
    name: 'BYOR Local Net',
    network: 'byortestnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['http://localhost:8545'] },
      default: { http: ['http://localhost:8545'] },
    },
  } as const satisfies Chain
}
