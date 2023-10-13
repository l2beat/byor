// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {Inputs} from "../src/Inputs.sol";
contract DeployScript is Script {

    function run() public {
        vm.startBroadcast();

        Inputs inputs = new Inputs();

        vm.stopBroadcast();
        console2.log(address(inputs));
    }
}
