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

export class TransactionExecutor {
  private readonly state: StateMap
  constructor(state: StateMap) {
    this.state = state
  }

  // TODO(radomski): Define what is the correct way to handle any of the
  // assertions below firing.
  executeBatch(batch: TransactionBatch, batchPoster: EthereumAddress): void {
    const feeRecipientAccount = getOrInsert(
      this.state,
      batchPoster.toString(),
      defaultState,
    )

    assert(batchPoster !== Hex(0x0000000000000000000000000000000000000000))

    for (const tx of batch) {
      // Step 0. Check transaction type
      assert(tx.from !== Hex(0) && tx.to !== Hex(0))

      const fromAccount = getOrInsert(
        this.state,
        tx.from.toString(),
        defaultState,
      )
      const toAccount = getOrInsert(this.state, tx.to.toString(), defaultState)

      // Step 1. Update nonce
      assert(
        fromAccount.nonce === Unsigned64(Unsigned64.toBigInt(tx.nonce) - 1n),
      )
      fromAccount.nonce = tx.nonce

      // Step 2. Subtract spending
      assert(
        Unsigned64.toBigInt(fromAccount.balance) >=
          Unsigned64.toBigInt(tx.value) + Unsigned64.toBigInt(tx.fee),
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
  }

  finalize(): StateMap {
    return this.state
  }
}

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
