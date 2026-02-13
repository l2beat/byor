// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Inputs} from "../src/Inputs.sol";

contract DeployScript is Script {
    function run() public returns (Inputs inputs) {
        vm.broadcast();
        inputs = new Inputs();
    }
}
