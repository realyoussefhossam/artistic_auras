# Plan 006: Add NatSpec documentation to ArtisticAuras.sol

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- src/ArtisticAuras.sol`
> If `src/ArtisticAuras.sol` changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

The contract currently has no contract-level or function-level NatSpec annotations. This makes it harder for humans and block explorers to understand the intended behavior, parameters, and access control of each function. Adding concise NatSpec improves maintainability and the quality of verified-source display on Etherscan without changing any runtime behavior.

## Current state

- `src/ArtisticAuras.sol` — 114 lines, no `///` annotations except the SPDX header and inline comments.

Relevant excerpt (`src/ArtisticAuras.sol:1-29`):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract ArtisticAuras is ERC721, ERC721Pausable, ERC2981, Ownable, ReentrancyGuard {
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
```

Repo conventions: SPDX comment at the top; inline comments for constants. Keep annotations concise and accurate.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Format check | `forge fmt --check` | exit 0 |
| Build | `forge build` | exit 0 |
| Test | `forge test -vvv` | all tests pass |

## Scope

**In scope**:
- `src/ArtisticAuras.sol` — add NatSpec comments only.

**Out of scope**:
- No behavior changes.
- No test changes unless a test was asserting the absence of comments.

## Git workflow

- Branch: `advisor/006-add-natspec-docs`
- Commit message style: `docs: add NatSpec to ArtisticAuras.sol`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add contract-level and function-level NatSpec

Add `///` annotations to `src/ArtisticAuras.sol`. Target shape (annotations only; keep existing code):

```solidity
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
/// @notice A 21-piece abstract NFT collection on Ethereum./// @dev Sequential token IDs 1..21 map to `metadata/<id>.json` via a mutable base URI.
contract ArtisticAuras is ERC721, ERC721Pausable, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 21;
    uint256 public constant MINT_PRICE = 0.04 ether;
    uint96 public constant ROYALTY_BASIS_POINTS = 500; // 5%

    bool public publicSaleActive;

    string private _baseTokenURI;

    event NFTMinted(address indexed to, uint256 indexed tokenId);

    /// @param baseURI The IPFS folder URI ending with `/` that contains `1.json`..`21.json`.
    constructor(string memory baseURI) ERC721("Artistic Auras", "AURA") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _setDefaultRoyalty(owner(), ROYALTY_BASIS_POINTS);
    }

    /// @notice Mints `quantity` tokens to the caller.
    /// @dev Requires public sale to be active, contract not paused, exact payment, and available supply.
    /// @param quantity The number of tokens to mint.
    function mint(uint256 quantity) external payable whenNotPaused whenPublicSaleActive nonReentrant {
        ...
    }

    /// @notice Mints `quantity` tokens to `to` without requiring payment.
    /// @dev Can only be called by the owner; bypasses public-sale and pause state.
    /// @param to The address receiving the tokens.
    /// @param quantity The number of tokens to mint.
    function mintToAddress(address to, uint256 quantity) external onlyOwner nonReentrant {
        ...
    }

    /// @notice Updates the base URI used by `tokenURI`.
    /// @param baseURI The new base URI ending with `/`.
    function setBaseURI(string calldata baseURI) external onlyOwner {
        ...
    }

    /// @notice Toggles the public sale state.
    /// @param active `true` to open the public sale, `false` to close it.
    function setPublicSaleActive(bool active) external onlyOwner {
        ...
    }

    /// @notice Sets the default royalty receiver and fee for all tokens.
    /// @param receiver Address that receives royalty payments.
    /// @param feeNumerator Royalty in basis points (e.g., 500 for 5%).
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        ...
    }

    /// @notice Sets a per-token royalty override.
    /// @param tokenId Token to override royalty for.
    /// @param receiver Address that receives royalty payments.
    /// @param feeNumerator Royalty in basis points.
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        ...
    }

    /// @notice Pauses all token transfers and public mints.
    function pause() external onlyOwner {
        ...
    }

    /// @notice Unpauses token transfers and public mints.
    function unpause() external onlyOwner {
        ...
    }

    /// @notice Withdraws the full contract ETH balance to the owner.
    function withdraw() external onlyOwner nonReentrant {
        ...
    }

    /// @notice Returns the number of tokens minted so far.
    /// @return The current total minted supply.
    function getTotalSupply() external view returns (uint256) {
        ...
    }
```

Also annotate internal overrides (`_baseURI`, `tokenURI`, `supportsInterface`, `_update`) with brief `@dev` notes where helpful.

**Verify**: `grep -c "/// " src/ArtisticAuras.sol` → returns a number greater than 0 (at least 15-20 annotations expected).

### Step 2: Format and verify build/tests

**Verify**: `forge fmt --check` → exit 0.
**Verify**: `forge build` → exit 0.
**Verify**: `forge test -vvv` → all tests pass.

## Test plan

No new tests are needed; this is a documentation-only change. The existing build and test suite confirms the annotations do not introduce syntax or behavior changes.

## Done criteria

- [ ] `src/ArtisticAuras.sol` contains contract-level NatSpec and NatSpec for every external/public function.
- [ ] No code behavior changed; `forge test -vvv` passes with the same number of tests as before.
- [ ] `forge fmt --check` passes.
- [ ] `forge build` passes.
- [ ] `plans/README.md` status row for plan 006 is updated to DONE.

## STOP conditions

Stop and report if:
- The contract file has drifted from the excerpt above.
- `forge build` fails after adding comments (e.g., malformed NatSpec).
- Any function's behavior changed while adding comments.

## Maintenance notes

- Keep NatSpec updated when adding or removing parameters.
- Do not duplicate OZ documentation for inherited functions unless this contract adds new semantics.
