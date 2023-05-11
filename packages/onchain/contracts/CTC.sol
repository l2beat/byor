// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CTC {
    event BatchAppended(address sender);

    function appendBatch(bytes calldata) external {
        require(msg.sender == tx.origin);
        emit BatchAppended(msg.sender);
    }
}
