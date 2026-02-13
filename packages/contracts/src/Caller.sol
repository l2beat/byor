// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Inputs} from "./Inputs.sol";

// Only used for testing
contract Caller {
    Inputs internal inputs;

    constructor(address inputsContract) {
        inputs = Inputs(inputsContract);
    }

    function appendBatch(bytes calldata batch) public {
        inputs.appendBatch(batch);
    }
}
