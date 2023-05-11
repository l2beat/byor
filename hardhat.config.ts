import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  paths: {
    sources: './packages/rollup/contracts',
    tests: './packages/rollup/test',
    cache: './build/hardhat/cache',
    artifacts: './build/hardhat/artifacts',
  },
}

export default config
