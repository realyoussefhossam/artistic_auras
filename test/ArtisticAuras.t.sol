// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {ArtisticAuras} from "../src/ArtisticAuras.sol";

contract ArtisticAurasTest is Test {
    ArtisticAuras public artisticAuras;
    address public owner;
    address public user1;
    address public user2;

    string public constant BASE_URI = "ipfs://QmTest/";
    uint256 public constant MINT_PRICE = 0.04 ether;
    uint256 public constant MAX_SUPPLY = 21;

    event NFTMinted(address indexed to, uint256 indexed tokenId);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.startPrank(owner);
        artisticAuras = new ArtisticAuras(BASE_URI);
        vm.stopPrank();
    }

    function _enableSale() internal {
        vm.prank(owner);
        artisticAuras.setPublicSaleActive(true);
    }

    function test_Constructor() public view {
        assertEq(artisticAuras.name(), "Artistic Auras");
        assertEq(artisticAuras.symbol(), "AURA");
        assertEq(artisticAuras.owner(), owner);
        assertEq(artisticAuras.MAX_SUPPLY(), MAX_SUPPLY);
        assertEq(artisticAuras.MINT_PRICE(), MINT_PRICE);
        assertEq(artisticAuras.maxMintPerAddress(), 1);
        assertEq(artisticAuras.publicSaleActive(), false);
        assertEq(artisticAuras.paused(), false);
    }

    function test_Mint() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.startPrank(user1);
        vm.expectEmit(true, true, true, true);
        emit NFTMinted(user1, 1);

        artisticAuras.mint{value: MINT_PRICE}(1);
        vm.stopPrank();

        assertEq(artisticAuras.ownerOf(1), user1);
        assertEq(artisticAuras.tokenURI(1), string.concat(BASE_URI, "1.json"));
        assertEq(artisticAuras.getTotalSupply(), 1);
        assertEq(artisticAuras.mintedCount(user1), 1);
    }

    function test_MintRevertsWithInsufficientPayment() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.startPrank(user1);
        vm.expectRevert("Insufficient payment");
        artisticAuras.mint{value: MINT_PRICE - 1}(1);
        vm.stopPrank();
    }

    function test_MintRevertsWhenMaxMintPerAddressReached() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE * 2);

        vm.startPrank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);
        vm.expectRevert("Max mint per address reached");
        artisticAuras.mint{value: MINT_PRICE}(1);
        vm.stopPrank();
    }

    function test_MintRevertsWhenSaleNotActive() public {
        vm.deal(user1, MINT_PRICE);

        vm.startPrank(user1);
        vm.expectRevert("Public sale is not active");
        artisticAuras.mint{value: MINT_PRICE}(1);
        vm.stopPrank();
    }

    function test_MintRevertsWhenPaused() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.prank(owner);
        artisticAuras.pause();

        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        artisticAuras.mint{value: MINT_PRICE}(1);
        vm.stopPrank();
    }

    function test_TransferRevertsWhenPaused() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.prank(owner);
        artisticAuras.pause();

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        artisticAuras.transferFrom(user1, user2, 1);
    }

    function test_PauseAndUnpause() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.prank(owner);
        artisticAuras.pause();
        assertEq(artisticAuras.paused(), true);

        vm.prank(owner);
        artisticAuras.unpause();
        assertEq(artisticAuras.paused(), false);

        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);
        assertEq(artisticAuras.ownerOf(1), user1);
    }

    function test_NonOwnerCannotPause() public {
        vm.startPrank(user1);
        vm.expectRevert();
        artisticAuras.pause();
        vm.stopPrank();
    }

    function test_NonOwnerCannotToggleSale() public {
        vm.startPrank(user1);
        vm.expectRevert();
        artisticAuras.setPublicSaleActive(true);
        vm.stopPrank();
    }

    function test_MintToAddressByOwner() public {
        vm.startPrank(owner);
        artisticAuras.mintToAddress(user2, 1);
        vm.stopPrank();

        assertEq(artisticAuras.ownerOf(1), user2);
        assertEq(artisticAuras.mintedCount(user2), 0);
    }

    function test_MintToAddressRevertsForNonOwner() public {
        vm.startPrank(user1);
        vm.expectRevert();
        artisticAuras.mintToAddress(user2, 1);
        vm.stopPrank();
    }

    function test_Withdraw() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        uint256 balanceBefore = owner.balance;

        vm.prank(owner);
        artisticAuras.withdraw();

        assertEq(owner.balance, balanceBefore + MINT_PRICE);
        assertEq(address(artisticAuras).balance, 0);
    }

    function test_DefaultRoyalty() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = artisticAuras.royaltyInfo(1, salePrice);

        assertEq(receiver, owner);
        assertEq(royaltyAmount, salePrice * artisticAuras.ROYALTY_BASIS_POINTS() / 10_000);
    }

    function test_SupportsERC2981Interface() public view {
        assertTrue(artisticAuras.supportsInterface(type(IERC2981).interfaceId));
    }

    function test_SetDefaultRoyaltyByOwner() public {
        vm.prank(owner);
        artisticAuras.setDefaultRoyalty(user2, 1_000);

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = artisticAuras.royaltyInfo(1, salePrice);

        assertEq(receiver, user2);
        assertEq(royaltyAmount, 0.1 ether);
    }

    function test_SetDefaultRoyaltyRevertsForNonOwner() public {
        vm.startPrank(user1);
        vm.expectRevert();
        artisticAuras.setDefaultRoyalty(user2, 1_000);
        vm.stopPrank();
    }
}
