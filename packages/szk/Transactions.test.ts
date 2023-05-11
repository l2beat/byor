import { EthereumAddress, Unsigned64 } from "./Transactions"
import { expect, assert } from "chai"

describe('EthereumAddress', function() {
    it('Should transform valid address', async function() {
        const address: EthereumAddress = EthereumAddress("0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce");
        expect(address).to.equal("0xdebdbc023f1b26b5999cc0e92e7aa4f5616e52ce");
    })

    it('Should throw with invalid address', async function() {
        assert.throws(() => EthereumAddress("0xdebdbcloremipsum999cc0e92e7aa4f5616e52ce"));
    })
})

describe('Unsigned64', function() {
    const MAX_U64 = 1n << 64n

    it('Should transform number zero', async function() {
        const value: Unsigned64 = Unsigned64(0);
        expect(value).to.equal(0n);
    })

    it('Should transform valid number', async function() {
        const value: Unsigned64 = Unsigned64(420);
        expect(value).to.equal(420n);
    })

    it('Should transform large number', async function() {
        const value: Unsigned64 = Unsigned64(2251804108652544);
        expect(value).to.equal(2251804108652544n);
    })

    it('Should throw for floating point number', async function() {
        assert.throws(() => Unsigned64(3.14159));
    })

    it('Should throw for negative number', async function() {
        assert.throws(() => Unsigned64(-1));
        assert.throws(() => Unsigned64(-3.14159));
    })

    it('Should transform bigint zero', async function() {
        const value: Unsigned64 = Unsigned64(0n);
        expect(value).to.equal(0n);
    })

    it('Should transform valid bigint', async function() {
        const value: Unsigned64 = Unsigned64(420n);
        expect(value).to.equal(420n);
    })

    it('Should transform large bigint', async function() {
        const value: Unsigned64 = Unsigned64(2251804108652544n);
        expect(value).to.equal(2251804108652544n);
    })

    it('Should transform unsigned 64bit limit bigint', async function() {
        const value: Unsigned64 = Unsigned64(MAX_U64);
        expect(value).to.equal(MAX_U64);
    })

    it('Should throw for negative bigint', async function() {
        assert.throws(() => Unsigned64(-1n));
        assert.throws(() => Unsigned64(-420n));
    })

    it('Should throw for bigint bigger than unsigned 64bit', async function() {
        assert.throws(() => Unsigned64(MAX_U64 + 1n));
    })
})
