// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ArtisticAuras is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 21;
    uint256 public constant MINT_PRICE = 0.04 ether;

    mapping(address => uint256) public mintedCount;
    uint256 public maxMintPerAddress = 1;

    // Event emitted when a new NFT is minted
    event NFTMinted(address indexed to, uint256 indexed _tokenId, string tokenURI);

    constructor() ERC721("Artistic Auras", "AURA") Ownable(msg.sender) {}

    function mint(string memory tokenURI) external payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIds < MAX_SUPPLY, "Max supply reached");
        require(mintedCount[msg.sender] < maxMintPerAddress, "Max mint per address reached");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        mintedCount[msg.sender]++;

        emit NFTMinted(msg.sender, newTokenId, tokenURI);
    }

    function mintToAddress(address to, string memory tokenURI) external onlyOwner {
        require(_tokenIds < MAX_SUPPLY, "Max supply reached");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(to, newTokenId, tokenURI);
    }

    function getTotalSupply() external view returns (uint256) {
        return _tokenIds;
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
}
