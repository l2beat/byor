import {
  Unsigned64,
  Hex,
  EthereumAddress,
  TransactionBatch,
  serializeAndSignBatch,
} from '@byor/shared'
import { command, positional, run, string, Type } from 'cmd-ts'
import fs from 'fs'
import { Hex as ViemHex, PrivateKeyAccount } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const HexStream: Type<string, Hex> = {
  async from(str): Promise<Hex> {
    return new Promise((resolve, _) => {
      resolve(Hex(str))
    })
  },
}

type GenesisStateMap = Record<string, number>

function generateRandomAddress(): Hex {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return Hex(Buffer.from(bytes).toString('hex'))
}

async function main(
  genesisState: GenesisStateMap,
  privateKey: Hex,
): Promise<void> {
  const account = privateKeyToAccount(privateKey.toString() as ViemHex)
  const accountBalance = genesisState[account.address]
  if (accountBalance === undefined) {
    throw new Error(
      'Provided private key account does not exist in the genesis file',
    )
  }

  const batch: TransactionBatch = []
  const PAYMENTS_COUNT = 100
  const PAYMENT_AMOUNT = Math.floor(
    (accountBalance - PAYMENTS_COUNT) / PAYMENTS_COUNT,
  )
  for (let i = 0; i < PAYMENTS_COUNT; i++) {
    const receiver = generateRandomAddress()
    batch.push({
      from: EthereumAddress(account.address),
      to: EthereumAddress(Hex.toString(receiver)),
      value: Unsigned64(PAYMENT_AMOUNT),
      nonce: Unsigned64(i),
      fee: Unsigned64(1),
    })
  }

  const _bytes = await serializeAndSignBatch(
    batch,
    account as PrivateKeyAccount,
  )
}

const cmd = command({
  name: 'seeder',
  description: 'Seed random addresses with founds from provided account',
  version: '1.0.0',
  args: {
    genesisFile: positional({ type: string, displayName: 'genesisFile' }),
    privateKey: positional({ type: HexStream, displayName: 'privateKey' }),
  },
  handler: async ({ genesisFile, privateKey }) => {
    const jsonContent = fs.readFileSync(genesisFile).toString()
    const genesisState = JSON.parse(jsonContent) as GenesisStateMap

    await main(genesisState, privateKey)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
})
