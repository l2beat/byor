// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Inputs.sol';

// Only used for testing
contract Caller {
    Inputs inputs;

    constructor(address inputsContract) {
        inputs = Inputs(inputsContract);
    }

    function appendBatch(bytes calldata batch) public {
        inputs.appendBatch(batch);
    }
}
