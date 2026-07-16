// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {ArtisticAuras} from "../src/ArtisticAuras.sol";

contract DeployArtisticAuras is Script {
    function run() external {
        string memory baseURI = vm.envString("METADATA_BASE_URI");

        vm.startBroadcast();
        ArtisticAuras artisticAuras = new ArtisticAuras(baseURI);
        address deployer = artisticAuras.owner();
        vm.stopBroadcast();

        console.log("ArtisticAuras deployed at:", address(artisticAuras));
        console.log("Deployer/owner address:", deployer);
        console.log("Token name:", artisticAuras.name());
        console.log("Token symbol:", artisticAuras.symbol());
        console.log("Max supply:", artisticAuras.MAX_SUPPLY());
        console.log("Mint price:", artisticAuras.MINT_PRICE());
        console.log("Public sale active:", artisticAuras.publicSaleActive());
        console.log("Paused:", artisticAuras.paused());
        console.log("Royalty basis points:", artisticAuras.ROYALTY_BASIS_POINTS());
        console.log("Base URI:", baseURI);
    }
}
