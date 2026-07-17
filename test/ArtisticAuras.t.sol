// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ArtisticAuras} from "../src/ArtisticAuras.sol";

contract ReentrantMinter is IERC721Receiver {
    ArtisticAuras public target;
    uint256 public maxCalls;
    uint256 public calls;

    constructor(ArtisticAuras _target, uint256 _maxCalls) {
        target = _target;
        maxCalls = _maxCalls;
    }

    function attack() external payable {
        target.mint{value: msg.value}(1);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
        if (calls++ < maxCalls) {
            target.mint{value: 0.04 ether}(1);
        }
        return this.onERC721Received.selector;
    }
}

contract ArtisticAurasTest is Test {
    ArtisticAuras public artisticAuras;
    address public owner;
    address public user1;
    address public user2;

    string public constant BASE_URI = "ipfs://QmTest/";
    uint256 public constant MINT_PRICE = 0.04 ether;
    uint256 public constant MAX_SUPPLY = 21;

    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string baseURI);
    event PublicSaleToggled(bool active);
    event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    event TokenRoyaltyUpdated(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);
    event Withdrawal(address indexed to, uint256 amount);

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
    }

    function test_MintRevertsWithInsufficientPayment() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.startPrank(user1);
        vm.expectRevert("Incorrect payment amount");
        artisticAuras.mint{value: MINT_PRICE - 1}(1);
        vm.stopPrank();
    }

    function test_MultipleMintsBySameWalletAllowed() public {
        _enableSale();
        uint256 quantity = 3;
        vm.deal(user1, MINT_PRICE * quantity);

        vm.startPrank(user1);
        artisticAuras.mint{value: MINT_PRICE * quantity}(quantity);
        vm.stopPrank();

        assertEq(artisticAuras.getTotalSupply(), quantity);
        assertEq(artisticAuras.ownerOf(quantity), user1);
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

    function test_MintRevertsWithOverpayment() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE * 2);

        vm.startPrank(user1);
        vm.expectRevert("Incorrect payment amount");
        artisticAuras.mint{value: MINT_PRICE * 2}(1);
        vm.stopPrank();
    }

    function test_MintRevertsWithZeroQuantity() public {
        _enableSale();

        vm.startPrank(user1);
        vm.expectRevert("Quantity must be greater than zero");
        artisticAuras.mint{value: 0}(0);
        vm.stopPrank();
    }

    function test_MintReentrancyGuardBlocksSupplyExploit() public {
        _enableSale();

        ReentrantMinter attacker = new ReentrantMinter(artisticAuras, 5);
        vm.deal(address(attacker), MINT_PRICE * 6);

        vm.expectRevert();
        attacker.attack{value: MINT_PRICE}();

        // No tokens should have been minted because the entire transaction reverted.
        assertEq(artisticAuras.getTotalSupply(), 0);
        assertEq(address(artisticAuras).balance, 0);
    }

    function test_SupplyCap() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE * (MAX_SUPPLY + 1));

        vm.startPrank(user1);
        artisticAuras.mint{value: MINT_PRICE * MAX_SUPPLY}(MAX_SUPPLY);
        assertEq(artisticAuras.getTotalSupply(), MAX_SUPPLY);
        assertEq(artisticAuras.ownerOf(MAX_SUPPLY), user1);

        vm.expectRevert("Max supply reached");
        artisticAuras.mint{value: MINT_PRICE}(1);
        vm.stopPrank();
    }

    function test_MintToAddressSupplyCap() public {
        vm.startPrank(owner);
        artisticAuras.mintToAddress(user2, MAX_SUPPLY);
        assertEq(artisticAuras.getTotalSupply(), MAX_SUPPLY);

        vm.expectRevert("Max supply reached");
        artisticAuras.mintToAddress(user2, 1);
        vm.stopPrank();
    }

    function test_WithdrawRevertsWhenBalanceIsZero() public {
        vm.startPrank(owner);
        vm.expectRevert("No funds to withdraw");
        artisticAuras.withdraw();
        vm.stopPrank();
    }

    function test_TokenURIRevertsForUnmintedToken() public {
        vm.expectRevert();
        artisticAuras.tokenURI(1);
    }

    function test_SetBaseURIUpdatesTokenURI() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        string memory newBaseURI = "ipfs://QmNew/";
        vm.prank(owner);
        artisticAuras.setBaseURI(newBaseURI);

        assertEq(artisticAuras.tokenURI(1), string.concat(newBaseURI, "1.json"));
    }

    function test_SetTokenRoyaltyUpdatesPerTokenReceiver() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.prank(owner);
        artisticAuras.setTokenRoyalty(1, user2, 1_000);

        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = artisticAuras.royaltyInfo(1, salePrice);

        assertEq(receiver, user2);
        assertEq(royaltyAmount, 0.1 ether);
    }

    function test_TransferAfterUnpauseWorks() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);

        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.prank(owner);
        artisticAuras.pause();

        vm.prank(owner);
        artisticAuras.unpause();

        vm.prank(user1);
        artisticAuras.transferFrom(user1, user2, 1);

        assertEq(artisticAuras.ownerOf(1), user2);
    }

    function test_SetBaseURIEmitsEvent() public {
        string memory newBaseURI = "ipfs://QmNew/";

        vm.expectEmit(false, false, false, true);
        emit BaseURIUpdated(newBaseURI);

        vm.prank(owner);
        artisticAuras.setBaseURI(newBaseURI);
    }

    function test_SetPublicSaleActiveEmitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit PublicSaleToggled(true);

        vm.prank(owner);
        artisticAuras.setPublicSaleActive(true);
    }

    function test_SetDefaultRoyaltyEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit DefaultRoyaltyUpdated(user2, 1_000);

        vm.prank(owner);
        artisticAuras.setDefaultRoyalty(user2, 1_000);
    }

    function test_SetTokenRoyaltyEmitsEvent() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.expectEmit(true, true, false, true);
        emit TokenRoyaltyUpdated(1, user2, 1_000);

        vm.prank(owner);
        artisticAuras.setTokenRoyalty(1, user2, 1_000);
    }

    function test_WithdrawEmitsEvent() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.expectEmit(true, false, false, true);
        emit Withdrawal(owner, MINT_PRICE);

        vm.prank(owner);
        artisticAuras.withdraw();
    }

    function test_ContractURIReturnsMetadataURI() public view {
        string memory expected = string(abi.encodePacked(BASE_URI, "contract_metadata.json"));
        assertEq(artisticAuras.contractURI(), expected);
    }
}
