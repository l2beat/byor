// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CanonicalTransactionChain {
    event BatchAppended(address sender);

    function appendBatch(bytes calldata) external {
        // By only allowing externally owned accounts to append batches, we
        // make sure that the calldata is simply part of the transaction data.
        require(msg.sender == tx.origin);
        emit BatchAppended(msg.sender);
    }
}
