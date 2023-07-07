import {
  assert,
  EthereumAddress,
  Hex,
  serializeAndSignBatch,
  Transaction,
  Unsigned64,
} from '@byor/shared'
import { command, positional, run, Type } from 'cmd-ts'
import { createPublicClient, createWalletClient, http } from 'viem'
import {
  english,
  generateMnemonic,
  mnemonicToAccount,
  privateKeyToAccount,
} from 'viem/accounts'

import { Config, getConfig } from '../../src/config'
import { abi } from '../../src/config/abi'
import GENESIS_STATE from '../../src/config/genesis.json'

function getGenesisState(): Record<string, number> {
  return GENESIS_STATE
}

async function main(config: Config, privateKey: Hex): Promise<void> {
  const genesisState = getGenesisState()
  const l2Account = privateKeyToAccount(privateKey.toString())
  const accountBalance = genesisState[l2Account.address]
  assert(
    accountBalance !== undefined,
    'Provided private key account does not exist in the genesis state',
  )

  const batch: Transaction[] = []
  const PAYMENTS_COUNT = 100
  const PAYMENT_AMOUNT = Math.floor(
    (accountBalance - PAYMENTS_COUNT) / PAYMENTS_COUNT,
  )
  for (let i = 0; i < PAYMENTS_COUNT; i++) {
    const receiver = mnemonicToAccount(generateMnemonic(english))
    batch.push({
      from: EthereumAddress(l2Account.address),
      to: EthereumAddress(receiver.address),
      value: Unsigned64(PAYMENT_AMOUNT),
      nonce: Unsigned64(i + 1),
      fee: Unsigned64(1),
    })
  }

  const bytes = await serializeAndSignBatch(batch, l2Account)
  await submitToL1(config, bytes)
}

async function submitToL1(
  config: Config,
  serializedBatchBytes: Hex,
): Promise<void> {
  const l1Account = privateKeyToAccount(config.privateKey.toString())
  const client = createWalletClient({
    account: l1Account,
    chain: config.chain,
    transport: http(),
  })

  const publicClient = createPublicClient({
    chain: config.chain,
    transport: http(),
  })

  const { request } = await publicClient.simulateContract({
    address: config.contractAddress.toString(),
    abi: abi,
    functionName: 'appendBatch',
    args: [serializedBatchBytes.toString()],
  })
  await client.writeContract(request)
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
    privateKey: positional({ type: HexValue, displayName: 'privateKey' }),
  },
  handler: async ({ privateKey }) => {
    const config = getConfig()
    await main(config, privateKey)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
  process.exit(1)
})
