import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import hre from 'hardhat'

describe('CTC', function () {
  const randomBytes = '0x12345678907654321234567890987654321234567890987654'

  async function getDeployer(): Promise<SignerWithAddress> {
    const accounts = await hre.ethers.getSigners()
    assert(accounts[0] !== undefined, 'First signer account is undefined')
    return accounts[0]
  }

  it('Should emit BatchAppended event', async function () {
    const deployer = await getDeployer()

    const CTC = await hre.ethers.getContractFactory('CTC')
    const ctc = await CTC.deploy()

    await expect(ctc.appendBatch(randomBytes))
      .to.emit(ctc, 'BatchAppended')
      .withArgs(await deployer.getAddress())
  })

  it('Should revert if called from another contract', async function () {
    const CTC = await hre.ethers.getContractFactory('CTC')
    const ctc = await CTC.deploy()
    const CTCRevert = await hre.ethers.getContractFactory('CTCRevert')
    const ctcRevert = await CTCRevert.deploy(ctc.address)

    await expect(ctcRevert.appendBatch(randomBytes)).to.be.reverted
  })
})
