// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract ArtisticAuras is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 21;
    uint256 public constant MINT_PRICE = 0.04 ether;

    mapping(address => uint256) public mintedCount;
    uint256 public maxMintPerAddress = 1;

    string private _baseTokenURI;

    event NFTMinted(address indexed to, uint256 indexed tokenId);

    constructor(string memory baseURI) ERC721("Artistic Auras", "AURA") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function mint(uint256 quantity) external payable {
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached");
        require(mintedCount[msg.sender] + quantity <= maxMintPerAddress, "Max mint per address reached");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds++;
            _safeMint(msg.sender, _tokenIds);
            emit NFTMinted(msg.sender, _tokenIds);
        }

        mintedCount[msg.sender] += quantity;
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

    function setMaxMintPerAddress(uint256 newMaxMint) external onlyOwner {
        maxMintPerAddress = newMaxMint;
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"));
    }
}
