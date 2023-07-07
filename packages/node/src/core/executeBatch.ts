import {
  EthereumAddress,
  SignedTransaction,
  Transaction,
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

const getOrDefault = (
  state: StateMap,
  key: string,
  defaultValue: StateMapValue,
): StateMapValue => {
  const result = state[key]
  if (result !== undefined) {
    return result
  } else {
    return defaultValue
  }
}

const DEFAULT_STATE: StateMapValue = {
  balance: Unsigned64(0),
  nonce: Unsigned64(0),
}

function canExecuteTransaction(state: StateMap, tx: Transaction): boolean {
  try {
    // Step 0. Check transaction type
    if (!(tx.from !== EthereumAddress.ZERO && tx.to !== EthereumAddress.ZERO)) {
      return false
    }

    const from = getOrDefault(state, tx.from.toString(), DEFAULT_STATE)

    // Step 1. Nonce is valid
    if (!(from.nonce === Unsigned64(tx.nonce.valueOf() - 1n))) {
      return false
    }

    // Step 2. Balance is high enough to allow spending
    if (!(from.balance.valueOf() >= tx.value.valueOf() + tx.fee.valueOf())) {
      return false
    }
  } catch (_) {
    return false
  }

  return true
}

// NOTE(radomski): This assumes that the transaction can be applied
function executeTransactionUnchecked(
  state: StateMap,
  tx: Transaction,
  feeRecipientAccount: StateMapValue,
): void {
  const fromAccount = getOrInsert(state, tx.from.toString(), DEFAULT_STATE)
  const toAccount = getOrInsert(state, tx.to.toString(), DEFAULT_STATE)

  // Step 1. Update nonce
  fromAccount.nonce = tx.nonce

  // Step 2. Subtract spending
  fromAccount.balance = Unsigned64(
    fromAccount.balance.valueOf() - (tx.value.valueOf() + tx.fee.valueOf()),
  )

  // Step 3. Transfer value
  toAccount.balance = Unsigned64(
    tx.value.valueOf() + toAccount.balance.valueOf(),
  )

  // Step 4. Pay fee
  feeRecipientAccount.balance = Unsigned64(
    tx.fee.valueOf() + feeRecipientAccount.balance.valueOf(),
  )
}

function removeEmptyStateMapValues(state: StateMap): StateMap {
  return Object.fromEntries(
    Object.entries(state).filter(
      (e) => !(e[1].nonce === Unsigned64(0) && e[1].balance === Unsigned64(0)),
    ),
  )
}

export function executeBatch(
  state: StateMap,
  batch: Transaction[],
  batchPoster: EthereumAddress,
): StateMap {
  const feeRecipientAccount = getOrInsert(
    state,
    batchPoster.toString(),
    DEFAULT_STATE,
  )

  for (const tx of batch) {
    // Step 0. Check if transaction can be executed
    if (!canExecuteTransaction(state, tx)) {
      continue
    }

    executeTransactionUnchecked(state, tx, feeRecipientAccount)
  }

  state = removeEmptyStateMapValues(state)
  return state
}

export function filterValidTxs(
  state: StateMap,
  batch: SignedTransaction[],
): SignedTransaction[] {
  const result = []

  const feeRecipientAccount = getOrInsert(
    state,
    EthereumAddress.ZERO.toString(),
    DEFAULT_STATE,
  )

  for (const tx of batch) {
    if (canExecuteTransaction(state, tx)) {
      result.push(tx)
      executeTransactionUnchecked(state, tx, feeRecipientAccount)
    }
  }

  return result
}
