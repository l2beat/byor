// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Inputs} from "../src/Inputs.sol";
import {Caller} from "../src/Caller.sol";

contract InputsTest is Test {
    bytes private constant RANDOM_BYTES = "0x12345678907654321234567890987654321234567890987654";
    address private constant BOB = address(0xb0b);
    Inputs private inputs;
    Caller private caller;

    event BatchAppended(address sender);

    function setUp() public {
        inputs = new Inputs();
        caller = new Caller(address(inputs));
    }

    function testEventBatchAppended() public {
        // should emit BatchAppended event.
        // expect address `bob` to be emitted.
        vm.prank(BOB, BOB);
        vm.expectEmit();
        emit BatchAppended(BOB);
        inputs.appendBatch(RANDOM_BYTES);
    }

    function testRevertCaller() public {
        // should revert if called from a contract
        vm.expectRevert();
        caller.appendBatch(RANDOM_BYTES);
    }
}
