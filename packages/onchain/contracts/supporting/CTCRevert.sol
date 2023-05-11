// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../CTC.sol";

contract CTCRevert {
    CTC ctc;
    constructor(address ctcContract) {
        ctc = CTC(ctcContract);
    }

    function appendBatch(bytes calldata batch) public {
        ctc.appendBatch(batch);
    }
}
