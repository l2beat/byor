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

    const CTC = await hre.ethers.getContractFactory('CanonicalTransactionChain')
    const ctc = await CTC.deploy()

    await expect(ctc.appendBatch(randomBytes))
      .to.emit(ctc, 'BatchAppended')
      .withArgs(await deployer.getAddress())
  })

  it('Should revert if called from another contract', async () => {
    const CTC = await hre.ethers.getContractFactory('CanonicalTransactionChain')
    const ctc = await CTC.deploy()
    const CTCRevert = await hre.ethers.getContractFactory(
      'CanonicalTransactionChainRevert',
    )
    const ctcRevert = await CTCRevert.deploy(ctc.address)

    await expect(ctcRevert.appendBatch(randomBytes)).to.be.reverted
  })
})
