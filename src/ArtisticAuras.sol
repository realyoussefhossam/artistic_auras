// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Artistic Auras
/// @author Youssef Hossam
/// @notice A 21-piece abstract NFT collection on Ethereum.
/// @dev Sequential token IDs 1..21 map to `metadata/<id>.json` via a mutable base URI.
contract ArtisticAuras is ERC721, ERC721Pausable, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 21;
    uint256 public constant MINT_PRICE = 0.04 ether;
    uint96 public constant ROYALTY_BASIS_POINTS = 500; // 5%

    bool public publicSaleActive;

    string private _baseTokenURI;
    string private _contractURI;

    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string baseURI);
    event PublicSaleToggled(bool active);
    event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    event TokenRoyaltyUpdated(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);
    event Withdrawal(address indexed to, uint256 amount);

    /// @param baseURI The IPFS folder URI ending with `/` that contains `1.json`..`21.json`.
    constructor(string memory baseURI) ERC721("Artistic Auras", "AURA") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _contractURI = string(abi.encodePacked(baseURI, "contract_metadata.json"));
        _setDefaultRoyalty(owner(), ROYALTY_BASIS_POINTS);
    }

    /// @notice Reverts when the public sale is not active.
    modifier whenPublicSaleActive() {
        require(publicSaleActive, "Public sale is not active");
        _;
    }

    /// @notice Mints `quantity` tokens to the caller.
    /// @dev Requires public sale to be active, contract not paused, exact payment, and available supply.
    /// @param quantity The number of tokens to mint.
    function mint(uint256 quantity) external payable whenNotPaused whenPublicSaleActive nonReentrant {
        require(quantity > 0, "Quantity must be greater than zero");
        require(msg.value == MINT_PRICE * quantity, "Incorrect payment amount");
        require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds++;
            _safeMint(msg.sender, _tokenIds);
            emit NFTMinted(msg.sender, _tokenIds);
        }
    }

    /// @notice Mints `quantity` tokens to `to` without requiring payment.
    /// @dev Can only be called by the owner; bypasses public-sale state and pause.
    /// @param to The address receiving the tokens.
    /// @param quantity The number of tokens to mint.
    function mintToAddress(address to, uint256 quantity) external onlyOwner nonReentrant {
        require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds++;
            _safeMint(to, _tokenIds);
            emit NFTMinted(to, _tokenIds);
        }
    }

    /// @notice Updates the base URI used by `tokenURI`.
    /// @param baseURI The new base URI ending with `/`.
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    /// @notice Toggles the public sale state.
    /// @param active `true` to open the public sale, `false` to close it.
    function setPublicSaleActive(bool active) external onlyOwner {
        publicSaleActive = active;
        emit PublicSaleToggled(active);
    }

    /// @notice Sets the default royalty receiver and fee for all tokens.
    /// @param receiver Address that receives royalty payments.
    /// @param feeNumerator Royalty in basis points (e.g., 500 for 5%).
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit DefaultRoyaltyUpdated(receiver, feeNumerator);
    }

    /// @dev Hook called by OpenZeppelin's Ownable when ownership changes.
    /// Automatically syncs the default royalty receiver to the new owner.
    function _transferOwnership(address newOwner) internal override {
        super._transferOwnership(newOwner);
        if (newOwner != address(0)) {
            _setDefaultRoyalty(newOwner, ROYALTY_BASIS_POINTS);
            emit DefaultRoyaltyUpdated(newOwner, ROYALTY_BASIS_POINTS);
        }
    }

    /// @notice Sets a per-token royalty override.
    /// @param tokenId Token to override royalty for.
    /// @param receiver Address that receives royalty payments.
    /// @param feeNumerator Royalty in basis points.
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit TokenRoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /// @notice Pauses all token transfers and public mints.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses token transfers and public mints.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Withdraws the full contract ETH balance to the owner.
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(owner(), balance);
    }

    /// @notice Returns the number of tokens minted so far.
    /// @return The current total minted supply.
    function getTotalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /// @notice Returns the collection-level metadata URI used by marketplaces.
    /// @return The URI pointing to the contract metadata JSON.
    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    /// @dev Returns the base URI set via `setBaseURI`.
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Returns the metadata URI for a minted token.
    /// @param tokenId The token ID to query.
    /// @return The concatenated URI pointing to `baseURI/<tokenId>.json`.
    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"));
    }

    /// @notice Checks whether the contract supports a given ERC-165 interface.
    /// @param interfaceId The interface identifier to check.
    /// @return True if the interface is supported.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Hook used by OpenZeppelin to enforce pause state on token transfers.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
