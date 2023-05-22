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
import { command, positional, run, string, Type } from 'cmd-ts'
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
  rpcUrl: string,
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
  await submitToL1(account, rpcUrl, bytes)
}

async function submitToL1(
  account: PrivateKeyAccount,
  rpcUrl: string,
  serializedBatchBytes: Hex,
): Promise<void> {
  const chain = { ...mainnet } as Chain
  chain.id = 31337
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
    // TODO(radomski: start using config I guess
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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

const cmd = command({
  name: 'seeder',
  description: 'Seed random addresses with funds from provided account',
  version: '1.0.0',
  args: {
    genesisFile: positional({ type: string, displayName: 'genesisFile' }),
    privateKey: positional({ type: HexValue, displayName: 'privateKey' }),
    rpcUrl: positional({ type: string, displayName: 'rpcUrl' }),
  },
  handler: async ({ genesisFile, privateKey, rpcUrl }) => {
    const genesisState = getGenesisState(genesisFile)

    await main(genesisState, privateKey, rpcUrl)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
  process.exit(1)
})
