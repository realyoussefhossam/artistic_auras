// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract ArtisticAuras is ERC721, ERC721Pausable, ERC2981, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 21;
    uint256 public constant MINT_PRICE = 0.04 ether;
    uint96 public constant ROYALTY_BASIS_POINTS = 500; // 5%

    bool public publicSaleActive;

    string private _baseTokenURI;

    event NFTMinted(address indexed to, uint256 indexed tokenId);

    constructor(string memory baseURI) ERC721("Artistic Auras", "AURA") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _setDefaultRoyalty(owner(), ROYALTY_BASIS_POINTS);
    }

    modifier whenPublicSaleActive() {
        require(publicSaleActive, "Public sale is not active");
        _;
    }

    function mint(uint256 quantity) external payable whenNotPaused whenPublicSaleActive {
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds++;
            _safeMint(msg.sender, _tokenIds);
            emit NFTMinted(msg.sender, _tokenIds);
        }
    }

    function mintToAddress(address to, uint256 quantity) external onlyOwner {
        require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds++;
            _safeMint(to, _tokenIds);
            emit NFTMinted(to, _tokenIds);
        }
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setPublicSaleActive(bool active) external onlyOwner {
        publicSaleActive = active;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getTotalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
