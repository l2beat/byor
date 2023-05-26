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
  constructor(
    private readonly l1StateManager: L1StateManager,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
    this.state = {}
    this.l1StateManager.on(TRANSACTIONS_COMMITED_EVENT, () => {
      this.state = this.l1StateManager.getState()
      this.mempool.empty()
    })
  }

  async tryToAdd(batchBytes: Hex): Promise<void> {
    this.logger.info('Trying to add a batch')
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
