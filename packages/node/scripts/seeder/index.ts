import {
  assert,
  EthereumAddress,
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

import { Config, getConfig } from '../../src/config'
import { abi } from '../../src/config/abi'
import { createChain } from '../../src/config/createChain'

async function main(config: Config, privateKey: Hex): Promise<void> {
  const genesisState = getGenesisState(config.genesisFilePath)
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
  await submitToL1(account, config, bytes)
}

async function submitToL1(
  account: PrivateKeyAccount,
  config: Config,
  serializedBatchBytes: Hex,
): Promise<void> {
  const chain = createChain(config.chainId, config.rpcUrl)

  const client = createWalletClient({
    account,
    chain,
    transport: http(),
  })

  await client.writeContract({
    address: config.ctcContractAddress.toString() as ViemHex,
    abi: abi,
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
    configPath: positional({ type: string, displayName: 'configPath' }),
    privateKey: positional({ type: HexValue, displayName: 'privateKey' }),
  },
  handler: async ({ configPath, privateKey }) => {
    const config = getConfig(configPath)

    await main(config, privateKey)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
  process.exit(1)
})
