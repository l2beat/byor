import { Chain } from 'viem/chains'

import { Config } from './Config'

export function createChain(config: Config): Chain {
  const result = {
    id: config.chainId,
    name: 'BYOR Destination Net',
    network: 'byordestnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: [config.rpcUrl] },
      default: { http: [config.rpcUrl] },
    },
  } as const satisfies Chain

  return result
}
