import { assert, expect } from 'chai'
import hre from 'hardhat'

describe('CTC', function () {
  const randomBytes = '0x12345678907654321234567890987654321234567890987654'

  it('Should emit BatchAppended event', async function () {
    const accounts = await hre.ethers.getSigners()
    assert(accounts[0] !== undefined, 'First signer accounts are undefined')

    const CTC = await hre.ethers.getContractFactory('CTC')
    const ctc = await CTC.deploy()

    const tx = await ctc.appendBatch(randomBytes)
    const receipt = await tx.wait()
    const appendedEvent = receipt.events?.filter(
      (x) => x.event === 'BatchAppended',
    )

    assert(
      appendedEvent !== undefined,
      'filtered BatchAppended events are undefined',
    )
    assert(
      appendedEvent[0] !== undefined,
      'first filtered BatchAppended event is undefined',
    )
    assert(
      appendedEvent[0].args !== undefined,
      'args for first filtered BatchAppended event are undefined',
    )

    expect(appendedEvent.length).to.equal(1)
    expect(appendedEvent[0].args.length).to.equal(1)
    expect(appendedEvent[0].args[0]).to.equal(await accounts[0].getAddress())
  })

  it('Should revert if called from another contract', async function () {
    const CTC = await hre.ethers.getContractFactory('CTC')
    const ctc = await CTC.deploy()
    const CTCRevert = await hre.ethers.getContractFactory('CTCRevert')
    const ctcRevert = await CTCRevert.deploy(ctc.address)

    await expect(ctcRevert.appendBatch(randomBytes)).to.be.reverted
  })
})
