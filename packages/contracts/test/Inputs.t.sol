// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Inputs} from "../src/Inputs.sol";
import {Caller} from "../src/Caller.sol";

contract InputsTest is Test {
    bytes constant randomBytes = '0x12345678907654321234567890987654321234567890987654';
    address constant bob = address(0xb0b);
    Inputs private inputs;
    Caller private caller; 

    event BatchAppended(address sender);

    function setUp() public {
        inputs = new Inputs();
        caller = new Caller(address(inputs));
    }

    function testEvent_BatchAppended() public {
        // expect address `bob` to be emitted
        vm.prank(bob, bob);
        vm.expectEmit();
        emit BatchAppended(bob);
        inputs.appendBatch(randomBytes);
    }

    function testRevert_Caller() public {
        // expect call to be reverted
        vm.expectRevert();
        caller.appendBatch(randomBytes);

    }
}
