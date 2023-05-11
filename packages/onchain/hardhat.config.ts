import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './build/cache',
    artifacts: './build/artifacts',
  },
  typechain: {
    outDir: 'build/typechain',
  },
}

export default config
