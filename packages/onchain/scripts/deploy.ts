import net from 'node:net'

import hre, { ethers } from 'hardhat'

const DEFAULT_HARDHAT_NODE_PORT = hre.tasks.node?.paramDefinitions.port
  ?.defaultValue as number

async function isPortReachable(
  port: number,
  host: string,
  timeout = 100,
): Promise<boolean> {
  const promise = new Promise((resolve, reject) => {
    const socket = new net.Socket()

    const onError = (): void => {
      socket.destroy()
      reject()
    }

    socket.setTimeout(timeout)
    socket.once('error', onError)
    socket.once('timeout', onError)

    socket.connect(port, host, () => {
      socket.end()
      resolve(0)
    })
  })

  try {
    await promise
    return true
  } catch {
    return false
  }
}

async function startPerpetualHardhatNode(): Promise<boolean> {
  hre.run('node').finally(() => {
    console.log('Stopping node')
  })

  return isPortReachable(DEFAULT_HARDHAT_NODE_PORT, '127.0.0.1', 5000)
}

async function main(): Promise<void> {
  if (hre.network.name === 'hardhat') {
    // If we don't provide a network, hardhat will create a new one, we will
    // deploy our contract to that node but once this function finishes
    // the node is stopped.  We want to have a node that keeps on
    // running, so if we say the node is on the hardhat network, manually
    // start a new one that won't shutdown after the contract is
    // deployed.
    await startPerpetualHardhatNode()
  }

  const CTC = await ethers.getContractFactory('CanonicalTransactionChain')
  const ctc = await CTC.deploy()
  await ctc.deployed()

  console.log(`CanonicalTransactionChain deployed to ${ctc.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
