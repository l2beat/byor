import { deserializeBatch, EthereumAddress, Hex, Logger } from '@byor/shared'
import { cloneDeep } from 'lodash'

import { executeBatch, StateMap } from '../../executeBatch'
import {
  L1StateManager,
  TRANSACTIONS_COMMITED_EVENT,
} from '../../L1StateManager'
import { Mempool } from './Mempool'

export class MempoolController {
  private state: StateMap
  private stateCommitHappend: boolean
  constructor(
    private readonly l1StateManager: L1StateManager,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
    this.state = {}
    this.stateCommitHappend = false
    this.l1StateManager.on(TRANSACTIONS_COMMITED_EVENT, () => {
      // NOTE(radomski): It would be the best if this callback could be async but
      // as the doc (https://nodejs.org/api/events.html#events_events) says:
      //  > When the EventEmitter object emits an event, all of the functions
      //  > attached to that specific event are called synchronously.
      //  > Any values returned by the called listeners are ignored and
      //  > will be discarded.
      // So we have to set a flag so we can update the state
      // asynchronously, AND we have to update the state
      // asynchronously because viem has an async import for some
      // reason? Other than that we are more ready for a database
      // swap where calls to it become async
      this.stateCommitHappend = true
    })
  }

  async updateStateIfNewCommited(): Promise<void> {
    if (this.stateCommitHappend) {
      this.logger.debug('Updating to new commited state')
      this.stateCommitHappend = false
      this.state = this.l1StateManager.getState()
      const txs = this.mempool.getTransactionsInPool()
      this.mempool.empty()
      for (const tx of txs) {
        try {
          await this.tryToAdd(tx)
        } catch (err) {
          this.logger.error(err)
        }
      }
    }
  }

  async tryToAdd(batchBytes: Hex): Promise<void> {
    this.logger.info('Trying to add a batch')
    await this.updateStateIfNewCommited()
    const batch = await deserializeBatch(batchBytes)
    this.state = executeBatch(
      cloneDeep(this.state),
      batch,
      EthereumAddress.ZERO,
    )
    this.mempool.add(batchBytes)
  }

  getState(): StateMap {
    return this.state
  }
}
