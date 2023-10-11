# BYOR

Build Your Own Rollup - A simple rollup implementation for educational purposes.

## Reading the code

If you want to read the code and understand how it works you should start with the following files:

1. [The smart contract](./packages/contracts/src/CanonicalTransactionChain.sol)
2. [The node](./packages/node/src/index.ts)

For more details about the architecture, see [here](./ARCHITECTURE.md).

## Running the code

### Prerequisites

Install the following:

- node v18
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- [foundry](https://book.getfoundry.sh/getting-started/installation)
- Postgresql. We recommend running it through docker for local development.

### Database

The recommended way of setting the postgres database is through docker using the commands below.

```
docker run -d --name=byor -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:14
docker exec -it byor psql -U postgres -c 'CREATE DATABASE byor_local'
docker exec -it byor psql -U postgres -c 'CREATE DATABASE byor_test'
```

If you restart your system running `docker start byor` will bring the database back online.

### Exection

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
yarn seeder 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
yarn start:clean
```

If you want to run the wallet application, follow these additional steps:

```bash
# open new terminal window
cd packages/wallet
yarn dev --port 8080
# open localhost:8080 in your web browser
```

### Sidenotes

Anvil is used because hardhat is incapable of filtering logs using the `fromBlock`/`toBlock`.
Read more about this issue [here](https://github.com/wagmi-dev/viem/discussions/366) and [here](https://github.com/foundry-rs/foundry/issues/4729).
