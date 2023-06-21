# Prerequisites

- Install node v20
- Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)
- Install [foundry](https://book.getfoundry.sh/getting-started/installation)

# Running

To build the application, follow these steps:

1. From the root of the project run `yarn && yarn build:dependencies`

To run the application, follow these steps:

1. Open three terminals and navigate to the project root.
2. In the first terminal, start the local chain using the `anvil` from [foundry](https://github.com/foundry-rs/foundry) (recommended).
3. In the second terminal, navigate to "packages/onchain".
4. Once the local chain is ready, deploy the smart contracts by running the deploy script: `yarn deploy --network localhost`.
5. In the third terminal, navigate to "packages/node".
6. Run the seeder script to set up the initial state: `yarn seeder src/config/stateSetup.json 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
7. Start a fresh node: `yarn start:clean src/config/stateSetup.json`.

If you want to run the wallet application, follow these additional steps:

1. Open a new terminal.
2. Change to "packages/wallet".
3. Start the wallet application in development mode: `yarn dev --port 8080`.
4. Open `localhost:8080` in your web browser.

## Sidenotes

Anvil is used because hardhat is incapable of filtering logs using the `fromBlock`/`toBlock`.
Read more about this issue [here](https://github.com/wagmi-dev/viem/discussions/366) and [here](https://github.com/foundry-rs/foundry/issues/4729).
