import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import hre from 'hardhat'

describe('CanonicalTransactionChain', () => {
  const randomBytes = '0x12345678907654321234567890987654321234567890987654'

  async function getDeployer(): Promise<SignerWithAddress> {
    const accounts = await hre.ethers.getSigners()
    assert(accounts[0] !== undefined, 'First signer account is undefined')
    return accounts[0]
  }

  it('Should emit BatchAppended event', async () => {
    const deployer = await getDeployer()

    const ctcFactory = await hre.ethers.getContractFactory(
      'CanonicalTransactionChain',
    )
    const ctc = await ctcFactory.deploy()

    await expect(ctc.appendBatch(randomBytes))
      .to.emit(ctc, 'BatchAppended')
      .withArgs(await deployer.getAddress())
  })

  it('Should revert if called from another contract', async () => {
    const ctcFactory = await hre.ethers.getContractFactory(
      'CanonicalTransactionChain',
    )
    const ctc = await ctcFactory.deploy()
    const callerFactory = await hre.ethers.getContractFactory('Caller')
    const caller = await callerFactory.deploy(ctc.address)

    await expect(caller.appendBatch(randomBytes)).to.be.reverted
  })
})
