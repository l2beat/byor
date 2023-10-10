# Node / Backend

## Data availability

Data availability is provided by L1 via posting the data as `calldata` to the `CTC` contract.
You can find the contract responsible for this in the [CanonicalTransactionChain.sol](./packages/contracts/src/CanonicalTransactionChain.sol).
It has a single function that can be called by anyone, and it's going to emit an event for easier retrieval of new batches.
Users can either send transactions to the contract or the sequencer that is later going to call the same function.

## State derivation

### Genesis state

The genesis state is defined by [genesis.json](./packages/node/src/config/genesis.json), it's a mapping of address to their initial balances in the genesis block.
These addresses are considered to be faucets, if their supply runs out, there are _currently_ no mechanisms of minting new tokens.

### Data fetching

Data is fetched by the [BatchDownloader.ts](./packages/node/src/core/BatchDownloader.ts), after it's downloaded, the `calldata` is extracted and passed through the State Transition Function by [StateUpdater.ts](./packages/node/src/core/StateUpdater.ts), the results are stored in the database.
BatchDownloader relies on the events emitted by the `CTC` to find all the necessary `calldata`.

### State transition function

Is responsible for taking inputs and by executing them creating a new state.
Batch ordering is defined by the order they appear on the L1, there is no internal state signaling the order.
The highest level entry point is `executeBatch` in [executeBatch.ts](./packages/node/src/core/executeBatch.ts).
It's responsible for validating and executing transactions that passed the validation.

### Storing the state

The state of accounts in stored in the database in a table called `accounts`, defined in [schema.ts](./packages/node/src/peripherals/database/shared/schema.ts).
It contains three rows:

- address, is the primary key to the row
- balance, the amount of tokens held by a given account
- nonce

Accounts that do not exist in the database have by default balance and nonce equal to zero.

## Sequencer

The role of the sequencer is to gather transactions that are sent to L2, in BYOR this is done by two parts:

- [Mempool.ts](./packages/node/src/peripherals/mempool/Mempool.ts)
- [BatchPoster.ts](./packages/node/src/core/BatchPoster.ts)

The BatchPoster is the one that actually batches and sends transactions to the DA - in the default case the L1 - the Mempool is just a helper.
Each sequencer has it's own mempool and transactions by default are sorted by the fee.

## Configuration of the node


# Wallet / Frontend

The frontend is stored in [here](./packages/wallet/).