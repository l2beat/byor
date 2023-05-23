import { deserializeBatch, EthereumAddress } from '@byor/shared'
import { zip } from 'lodash'

import { AccountRepository } from './db/AccountRepository'
import { L1EventStateType } from './L1EventStateType'
import { L1StateFetcher } from './L1StateFetcher'
import { StateMap, TransactionExecutor } from './TransactionExecutor'

export class L1StateManager {
  private readonly accountRepository: AccountRepository
  private readonly l1Fetcher: L1StateFetcher

  constructor(accountRepository: AccountRepository, l1Fetcher: L1StateFetcher) {
    this.accountRepository = accountRepository
    this.l1Fetcher = l1Fetcher
  }

  async start(): Promise<void> {
    const eventState = await this.l1Fetcher.getWholeState()
    await this.apply(eventState)
  }

  private async apply(l1States: L1EventStateType[]): Promise<void> {
    const batches = await Promise.all(
      l1States.map((state) => deserializeBatch(state.calldata)),
    )

    const initialState: StateMap = {}
    this.accountRepository.getAll().forEach(
      (acc) =>
        (initialState[acc.address.toString()] = {
          balance: acc.balance,
          nonce: acc.nonce,
        }),
    )

    const txExecutor = new TransactionExecutor(initialState)

    for (const [batch, state] of zip(batches, l1States)) {
      // NOTE(radomski): We know that it won't be undefined
      // because of the assert at the beginning of this function
      // eslint-disable-next-line
      txExecutor.executeBatch(batch!, state!.poster)
    }

    const updatedState = txExecutor.finalize()
    this.accountRepository.addOrUpdateMany(
      Object.entries(updatedState).map(([address, value]) => {
        return {
          address: EthereumAddress(address),
          balance: value.balance,
          nonce: value.nonce,
        }
      }),
    )
  }
}
