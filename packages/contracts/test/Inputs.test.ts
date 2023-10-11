import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import hre from 'hardhat'

describe('Inputs', () => {
  const randomBytes = '0x12345678907654321234567890987654321234567890987654'

  async function getDeployer(): Promise<SignerWithAddress> {
    const accounts = await hre.ethers.getSigners()
    assert(accounts[0] !== undefined, 'First signer account is undefined')
    return accounts[0]
  }

  it('Should emit BatchAppended event', async () => {
    const deployer = await getDeployer()

    const inputsFactory = await hre.ethers.getContractFactory(
      'Inputs',
    )
    const inputs = await inputsFactory.deploy()

    await expect(inputs.appendBatch(randomBytes))
      .to.emit(inputs, 'BatchAppended')
      .withArgs(await deployer.getAddress())
  })

  it('Should revert if called from another contract', async () => {
    const inputsFactory = await hre.ethers.getContractFactory(
      'Inputs',
    )
    const inputs = await inputsFactory.deploy()
    const callerFactory = await hre.ethers.getContractFactory('Caller')
    const caller = await callerFactory.deploy(inputs.address)

    await expect(caller.appendBatch(randomBytes)).to.be.reverted
  })
})
