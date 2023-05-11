import { expect } from 'chai'
import hre from 'hardhat'

describe('CTC', function () {
  const randomBytes = '0x12345678907654321234567890987654321234567890987654'

  it('Should emit BatchAppended event', async function () {
    const [deployer] = await hre.ethers.getSigners()

    const CTC = await hre.ethers.getContractFactory('CTC')
    const ctc = await CTC.deploy()

    await expect(ctc.appendBatch(randomBytes))
      .to.emit(ctc, 'BatchAppended')
      .withArgs(await deployer?.getAddress())
  })

  it('Should revert if called from another contract', async function () {
    const CTC = await hre.ethers.getContractFactory('CTC')
    const ctc = await CTC.deploy()
    const CTCRevert = await hre.ethers.getContractFactory('CTCRevert')
    const ctcRevert = await CTCRevert.deploy(ctc.address)

    await expect(ctcRevert.appendBatch(randomBytes)).to.be.reverted
  })
})
