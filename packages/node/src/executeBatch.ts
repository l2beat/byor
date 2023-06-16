import {
  assert,
  EthereumAddress,
  Hex,
  TransactionBatch,
  Unsigned64,
} from '@byor/shared'

export interface StateMapValue {
  balance: Unsigned64
  nonce: Unsigned64
}
export type StateMap = Record<string, StateMapValue>

const getOrInsert = (
  state: StateMap,
  key: string,
  defaultValue: StateMapValue,
): StateMapValue => {
  const result = state[key]
  if (result !== undefined) {
    return result
  } else {
    state[key] = { ...defaultValue }
    // NOTE(radomski): We know that it won't be undefined we insert into that slot in the above line
    // eslint-disable-next-line
    return state[key]!
  }
}

const defaultState: StateMapValue = {
  balance: Unsigned64(0),
  nonce: Unsigned64(0),
}

// NOTE(radomski): If a single transaction in the entire batch fails the entire
// batch is dropped. This is by design to reduce complexity. In the real world
// you would try to order transaction in such a way to maximie the fee you're
// going to receive as well as the amount of transactions that will go through.
export function executeBatch(
  state: StateMap,
  batch: TransactionBatch,
  batchPoster: EthereumAddress,
): StateMap {
  const feeRecipientAccount = getOrInsert(
    state,
    batchPoster.toString(),
    defaultState,
  )

  for (const tx of batch) {
    // Step 0. Check transaction type
    assert(
      tx.from !== Hex(0) && tx.to !== Hex(0),
      'Invalid recipient or sender',
    )

    const fromAccount = getOrInsert(state, tx.from.toString(), defaultState)
    const toAccount = getOrInsert(state, tx.to.toString(), defaultState)

    // Step 1. Update nonce
    assert(
      fromAccount.nonce === Unsigned64(Unsigned64.toBigInt(tx.nonce) - 1n),
      `Invalid nonce, expected/got = ${
        Unsigned64.toBigInt(fromAccount.nonce) + 1n
      }/${Unsigned64.toBigInt(tx.nonce)}`,
    )
    fromAccount.nonce = tx.nonce

    // Step 2. Subtract spending
    assert(
      Unsigned64.toBigInt(fromAccount.balance) >=
        Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(tx.fee),
      `Balance too low, needed/got = ${
        Unsigned64.toBigInt(tx.fee) + Unsigned64.toBigInt(tx.value)
      }/${Unsigned64.toBigInt(fromAccount.balance)}`,
    )

    fromAccount.balance = Unsigned64(
      Unsigned64.toBigInt(fromAccount.balance) -
        (Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(tx.fee)),
    )

    // Step 3. Transfer value
    toAccount.balance = Unsigned64(
      Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(toAccount.balance),
    )

    // Step 4. Pay fee
    feeRecipientAccount.balance = Unsigned64(
      Unsigned64.toBigInt(tx.fee) +
        Unsigned64.toBigInt(feeRecipientAccount.balance),
    )
  }

  return state
}
