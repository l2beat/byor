import { EthereumAddress, Unsigned64 } from '@byor/shared'
import { expect } from 'earl'

import { executeBatch, StateMap } from './executeBatch'

describe(executeBatch.name, () => {
  it('executes an empty transaction to update the nonce of the sender only', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(0),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {}

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(0),
        nonce: Unsigned64(1),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      },
    })
  })

  it('executes a transaction with zero fee, balance should change', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
    } as StateMap

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(10),
        nonce: Unsigned64(1),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(10),
        nonce: Unsigned64(0),
      },
    })
  })

  it('executes a transaction with fee, everyones balance should change', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(3),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
    } as StateMap

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(7),
        nonce: Unsigned64(1),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(3),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(10),
        nonce: Unsigned64(0),
      },
    })
  })

  it('adds to the existing balance', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(100),
        nonce: Unsigned64(0),
      },
    } as StateMap

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(10),
        nonce: Unsigned64(1),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(110),
        nonce: Unsigned64(0),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      },
    })
  })

  it('multiple transactions in a batch without fee', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
      {
        from: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        to: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        value: Unsigned64(5),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(100),
        nonce: Unsigned64(0),
      },
    } as StateMap

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(15),
        nonce: Unsigned64(1),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(105),
        nonce: Unsigned64(1),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(0),
        nonce: Unsigned64(0),
      },
    })
  })

  it('multiple transactions in a batch with fee', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(10),
      },
      {
        from: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        to: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        value: Unsigned64(5),
        nonce: Unsigned64(1),
        fee: Unsigned64(8),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(100),
        nonce: Unsigned64(0),
      },
    } as StateMap

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(5),
        nonce: Unsigned64(1),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(97),
        nonce: Unsigned64(1),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(18),
        nonce: Unsigned64(0),
      },
    })
  })

  it('balance from fees can be spent within the same batch', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(1),
        fee: Unsigned64(10),
      },
      {
        from: EthereumAddress('0x51ddc592af782F17605005bC9D77733112BfdB83'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(8),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    let state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(100),
        nonce: Unsigned64(0),
      },
    } as StateMap

    state = executeBatch(state, batch, batchPoster)

    expect(state).toEqual({
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(0),
        nonce: Unsigned64(1),
      },
      '0x06770a683570610eA237B6321dF9B80b965C8A22': {
        balance: Unsigned64(118),
        nonce: Unsigned64(0),
      },
      '0x51ddc592af782F17605005bC9D77733112BfdB83': {
        balance: Unsigned64(2),
        nonce: Unsigned64(1),
      },
    })
  })

  it('throws on zero nonce', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(10),
        nonce: Unsigned64(0),
        fee: Unsigned64(10),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws on nonce repeat', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(0),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(0),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws trying to spend from an empty account', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(1),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws trying to include an empty transaction with a fee from an empty account', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(0),
        nonce: Unsigned64(1),
        fee: Unsigned64(1),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws trying to spend more than the account has with no fee', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(25),
        nonce: Unsigned64(1),
        fee: Unsigned64(0),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
    }

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws trying to spend more than the account has with fee', async () => {
    const batch = [
      {
        from: EthereumAddress('0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(15),
        nonce: Unsigned64(1),
        fee: Unsigned64(7),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {
      '0x3ff8Fc7Ee9e644e93E1E099d3C0c0d1ff0843876': {
        balance: Unsigned64(20),
        nonce: Unsigned64(0),
      },
    }

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws on invalid transaction sender', async () => {
    const batch = [
      {
        from: EthereumAddress('0x0000000000000000000000000000000000000000'),
        to: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        value: Unsigned64(15),
        nonce: Unsigned64(1),
        fee: Unsigned64(7),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws on invalid transaction receiver', async () => {
    const batch = [
      {
        from: EthereumAddress('0x06770a683570610eA237B6321dF9B80b965C8A22'),
        to: EthereumAddress('0x0000000000000000000000000000000000000000'),
        value: Unsigned64(15),
        nonce: Unsigned64(1),
        fee: Unsigned64(7),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws on invalid transaction receiver and sender', async () => {
    const batch = [
      {
        from: EthereumAddress('0x0000000000000000000000000000000000000000'),
        to: EthereumAddress('0x0000000000000000000000000000000000000000'),
        value: Unsigned64(15),
        nonce: Unsigned64(1),
        fee: Unsigned64(7),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x51ddc592af782F17605005bC9D77733112BfdB83',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })

  it('throws on invalid batch poster', async () => {
    const batch = [
      {
        from: EthereumAddress('0x0000000000000000000000000000000000000000'),
        to: EthereumAddress('0x0000000000000000000000000000000000000000'),
        value: Unsigned64(15),
        nonce: Unsigned64(1),
        fee: Unsigned64(7),
      },
    ]
    const batchPoster = EthereumAddress(
      '0x0000000000000000000000000000000000000000',
    )
    const state = {}

    expect(() => executeBatch(state, batch, batchPoster)).toThrow()
  })
})
