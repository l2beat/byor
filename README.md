# Prerequisites

Install the following:

- node v20
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)
- [foundry](https://book.getfoundry.sh/getting-started/installation)
- sqlite3 (the command line interface, not the library)

# Running

To build the application, follow these steps:

1. From the root of the project run `yarn && yarn build:dependencies`

To run the application, follow these steps:

```bash
anvil
# open new terminal window
cd packages/contracts
yarn deploy --network localhost
# open new terminal window
cd packages/node
yarn seeder src/config/stateSetup.json 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
yarn start:clean src/config/stateSetup.json
```

If you want to run the wallet application, follow these additional steps:

```bash
# open new terminal window
cd packages/wallet
yarn dev --port 8080
# open localhost:8080 in your web browser
```

## Sidenotes

Anvil is used because hardhat is incapable of filtering logs using the `fromBlock`/`toBlock`.
Read more about this issue [here](https://github.com/wagmi-dev/viem/discussions/366) and [here](https://github.com/foundry-rs/foundry/issues/4729).

## Reading the code

If you want to read the code and understand how it works you should start with the following files:

1. [The smart contract](./packages/contracts/src/CanonicalTransactionChain.sol)
2. [The node](./packages/node/src/index.ts)
