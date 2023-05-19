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
import { Hex as ViemHex } from 'viem'
import {
  english,
  generateMnemonic,
  mnemonicToAccount,
  privateKeyToAccount,
} from 'viem/accounts'

async function main(
  genesisState: GenesisStateMap,
  privateKey: Hex,
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
      nonce: Unsigned64(i),
      fee: Unsigned64(1),
    })
  }

  const _bytes = await serializeAndSignBatch(batch, account)
  // TODO(radomski): Submit these bytes to CTC
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
  },
  handler: async ({ genesisFile, privateKey }) => {
    const genesisState = getGenesisState(genesisFile)

    await main(genesisState, privateKey)
  },
})

run(cmd, process.argv.slice(2)).catch((e) => {
  console.log(e)
  process.exit(1)
})
