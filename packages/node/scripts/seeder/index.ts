import {
  assert,
  EthereumAddress,
  GenesisStateMap,
  getGenesisState,
  Hex,
  serializeAndSignBatch,
  TransactionBatch,
  Unsigned64,
} from '@byor/shared'
import { command, number, positional, run, string, Type } from 'cmd-ts'
import {
  createWalletClient,
  Hex as ViemHex,
  http,
  PrivateKeyAccount,
} from 'viem'
import {
  english,
  generateMnemonic,
  mnemonicToAccount,
  privateKeyToAccount,
} from 'viem/accounts'
import { Chain, mainnet } from 'viem/chains'

async function main(
  genesisState: GenesisStateMap,
  privateKey: Hex,
  contractAddress: EthereumAddress,
  rpcUrl: string,
  chainId: number,
): Promise<void> {
  const account = privateKeyToAccount(privateKey.toString() as ViemHex)
  const accountBalance = genesisState[account.address]
  assert(
    accountBalance !== undefined,
    'Provided private key account does not exist in the genesis state',
  )

  const batch: TransactionBatch = []
  const PAYMENTS_COUNT = 100
  const PAYMENT_AMOUNT = Math.floor(
    (accountBalance - PAYMENTS_COUNT) / PAYMENTS_COUNT,
  )
  for (let i = 0; i < PAYMENTS_COUNT; i++) {
    const receiver = mnemonicToAccount(generateMnemonic(english))
    batch.push({
      from: EthereumAddress(account.address),
      to: EthereumAddress(receiver.address),
      value: Unsigned64(PAYMENT_AMOUNT),
      nonce: Unsigned64(i + 1),
      fee: Unsigned64(1),
    })
  }

  const bytes = await serializeAndSignBatch(batch, account)
  await submitToL1(account, contractAddress, rpcUrl, bytes, chainId)
}

async function submitToL1(
  account: PrivateKeyAccount,
  contractAddress: EthereumAddress,
  rpcUrl: string,
  serializedBatchBytes: Hex,
  chainId: number,
): Promise<void> {
  const chain = { ...mainnet } as Chain
  chain.id = chainId
  chain.rpcUrls = {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  }

  const client = createWalletClient({
    account,
    chain,
    transport: http(),
  })

  const wagmiAbi = [
    {
      inputs: [
        {
          internalType: 'bytes',
          name: '',
          type: 'bytes',
        },
      ],
      name: 'appendBatch',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const

  await client.writeContract({
    address: contractAddress,
    abi: wagmiAbi,
    functionName: 'appendBatch',
    args: [serializedBatchBytes.toString() as ViemHex],
  })
}

const HexValue: Type<string, Hex> = {
  async from(str): Promise<Hex> {
    return new Promise((resolve, _) => {
      resolve(Hex(str))
    })
  },
}

const EthereumAddressValue: Type<string, EthereumAddress> = {
  async from(str): Promise<EthereumAddress> {
    return new Promise((resolve, _) => {
      resolve(EthereumAddress(str))
    })
  },
}

const cmd = command({
  name: 'seeder',
  description: 'Seed random addresses with funds from provided account',
  version: '1.0.0',
  args: {
    genesisFile: positional({ type: string, displayName: 'genesisFile' }),
    privateKey: positional({ type: HexValue, displayName: 'privateKey' }),
    contractAddress: positional({
      type: EthereumAddressValue,
      displayName: 'contractAddress',
    }),
    rpcUrl: positional({ type: string, displayName: 'rpcUrl' }),
    chainId: positional({ type: number, displayName: 'chainId' }),
  },
  handler: async ({
    genesisFile,
    privateKey,
    contractAddress,
    rpcUrl,
    chainId,
  }) => {
    const genesisState = getGenesisState(genesisFile)

    await main(genesisState, privateKey, contractAddress, rpcUrl, chainId)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
  process.exit(1)
})
