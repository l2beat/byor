import { deserializeBatch, EthereumAddress, Hex, Logger } from '@byor/shared'

import { executeBatch, StateMap } from '../../executeBatch'
import { Mempool } from './Mempool'

export class MempoolController {
  constructor(
    private state: StateMap,
    private readonly mempool: Mempool,
    private readonly logger: Logger,
  ) {
    this.logger = logger.for(this)
  }

  async tryToAdd(batchBytes: Hex): Promise<void> {
    this.logger.info('Trying to add a batch')
    const batch = await deserializeBatch(batchBytes)
    this.state = executeBatch(this.state, batch, EthereumAddress.ZERO)
    this.mempool.add(batch)
  }

  getState(): StateMap {
    return this.state
  }
}
