// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import {ArtisticAuras} from "../src/ArtisticAuras.sol";

contract ArtisticAurasTest is Test {
    ArtisticAuras public artisticauras;
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    uint256 public constant MINT_PRICE = 0.04 ether;
    uint256 public constant MAX_SUPPLY = 21;

    event NFTMinted(address indexed to, uint256 indexed _tokenId, string tokenURI);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        vm.startPrank(owner);
        artisticauras = new ArtisticAuras();
        vm.stopPrank();
    }

    function test_Constructor() public view {
        assertEq(artisticauras.name(), "Artistic Auras");
        assertEq(artisticauras.symbol(), "AURA");
        assertEq(artisticauras.owner(), owner);
        assertEq(artisticauras.MAX_SUPPLY(), MAX_SUPPLY);
        assertEq(artisticauras.MINT_PRICE(), MINT_PRICE);
        assertEq(artisticauras.maxMintPerAddress(), 1);
    }

    function test_Mint() public {
        string memory tokenURI = "ipfs://example_token_uri";

        vm.deal(user1, MINT_PRICE);
        vm.startPrank(user1);
        vm.expectEmit(true, true, true, true);
        emit NFTMinted(user1, 1, tokenURI);

        artisticauras.mint{value: MINT_PRICE}(tokenURI);
        vm.stopPrank();

        assertEq(artisticauras.ownerOf(1), user1);
        assertEq(artisticauras.tokenURI(1), tokenURI);
        assertEq(artisticauras.getTotalSupply(), 1);
        assertEq(artisticauras.mintedCount(user1), 1);
    }
}
