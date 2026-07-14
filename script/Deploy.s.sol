// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {ArtisticAuras} from "../src/ArtisticAuras.sol";

contract DeployArtisticAuras is Script {
    function run() external {
        vm.startBroadcast();
        ArtisticAuras artisticAuras = new ArtisticAuras();
        address deployer = artisticAuras.owner();

        console.log("ArtisticAuras deployed at:", address(artisticAuras));
        console.log("Deployer address:", deployer);
        console.log("Owner address:", artisticAuras.owner());

        console.log("Token name:", artisticAuras.name());
        console.log("Token symbol:", artisticAuras.symbol());
        console.log("Max supply:", artisticAuras.MAX_SUPPLY());
        console.log("Mint price:", artisticAuras.MINT_PRICE());
        console.log("Max mint per address:", artisticAuras.maxMintPerAddress());
        vm.stopBroadcast();
    }
}
