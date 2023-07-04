// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './CanonicalTransactionChain.sol';

// Only used for testing
contract Caller {
    CanonicalTransactionChain ctc;

    constructor(address ctcContract) {
        ctc = CanonicalTransactionChain(ctcContract);
    }

    function appendBatch(bytes calldata batch) public {
        ctc.appendBatch(batch);
    }
}
