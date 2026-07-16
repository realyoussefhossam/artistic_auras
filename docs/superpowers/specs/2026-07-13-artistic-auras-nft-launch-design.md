# Artistic Auras NFT Launch — Design Spec

**Date:** 2026-07-13  
**Status:** Approved by Youssef Hossam  
**Scope:** Full launch plan for the Artistic Auras NFT collection on Ethereum mainnet.

---

## 1. Background & Context

The repository contains a 21-token abstract NFT collection called **Artistic Auras**. The current assets are:

- `metadata-Files.csv` — one row per token with token ID, name, description, attributes, image filename, Pinata image CID, and Pinata JSON CID.
- `special/special/` — the 21 artwork image files (mixed `.png` / `.PNG` extensions).

The CSV and image files need minor cleanup before they can be used reliably by a smart contract and a minting website. The launch will use an OpenZeppelin ERC-721 contract, a Next.js frontend, and Foundry for testing/deployment.

---

## 2. Goals

1. Launch a 21-token ERC-721 NFT collection on Ethereum mainnet.
2. Provide a clean, validated metadata set pinned to IPFS/Pinata.
3. Deploy a fixed-price public-sale contract at 0.04 ETH per token.
4. Build a responsive Next.js minting website using shadcn/ui.
5. Hand ownership of the contract to the client’s wallet after mainnet deployment.
6. Include testnet validation on Sepolia before mainnet.

---

## 3. Non-Goals

- No delayed reveal; metadata is public from launch.
- No allowlist / presale mechanics.
- No on-chain randomness or generative traits.
- No on-chain governance or DAO mechanics.
- No fiat on-ramp (users pay with ETH from their own wallet).

---

## 4. Requirements Summary

| Requirement | Decision |
|-------------|----------|
| Blockchain | Ethereum mainnet |
| Testnet | Sepolia |
| Contract standard | OpenZeppelin ERC-721 (v5.x) |
| Framework | Foundry |
| Total supply | 21 (fixed) |
| Mint model | Fixed-price public sale |
| Mint price | `0.04 ether` per token (fixed) |
| Max mint per wallet | Unlimited |
| Royalties | 5% (500 basis points) via ERC-2981 |
| Metadata reveal | Visible immediately |
| Mint proceeds | Owner wallet only |
| Ownership after launch | Transfer from deployer to client wallet |
| Frontend | Next.js + shadcn/ui + Tailwind + RainbowKit + wagmi + viem |
| Metadata cleanup | Yes — normalize CSV and regenerate/validate JSONs |

---

## 5. Architecture

```
Artist/Client assets
        │
        ▼
┌───────────────────┐
│  metadata-Files   │
│     .csv          │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐     ┌─────────────────────┐
│  Cleanup script   │────▶│  metadata/*.json      │
│  (Python)         │     │  (OpenSea standard)   │
└───────────────────┘     └──────────┬────────────┘
                                   │
                                   ▼
                            Pinata / IPFS
                                   │
                                   ▼
                         ipfs://<folder-cid>/
                                   │
                                   ▼
┌──────────────────────┐     ┌──────────────────────┐
│  Ethereum ERC-721    │◀────│  Next.js mint site   │
│  contract (Foundry)  │────▶│  RainbowKit + wagmi  │
└──────────────────────┘     └──────────────────────┘
```

---

## 6. Metadata Pipeline

### 6.1 Cleanup steps

1. Read `metadata-Files.csv` with UTF-8 encoding.
2. Trim leading/trailing whitespace from all column headers.
3. Rename all image files in `special/special/` to lowercase `.png` and update the CSV `file_name` column to match.
4. Remove the `"""` triple-quote wrapper around descriptions.
5. Ensure every token ID is unique and every row has a matching image file.
6. Standardize attribute object keys to snake_case or PascalCase consistent with OpenSea.
7. Convert Pinata gateway image URLs (e.g. `https://gateway.pinata.cloud/ipfs/...`) in the CSV to canonical `ipfs://<cid>` URIs in the generated JSON metadata.

### 6.2 JSON generation

Generate one JSON file per token in `metadata/<sequential-id>.json` where `sequential-id` runs from `1` to `21` in CSV row order:

```json
{
  "name": "Artistic-Auras #6",
  "description": "An abstract representation of cosmic birth...",
  "image": "ipfs://QmWK6YNnU7DzY12vAXMZ8QFCjNHfkAzkedmgmfDa8qDkjP",
  "attributes": [
    { "trait_type": "Color Scheme", "value": "Red, Yellow, Orange, Black, Blue" },
    { "trait_type": "Energy Source", "value": "Fiery Orb" },
    ...
  ]
}
```

The original CSV `tokenID` is preserved in `out/metadata-Files.cleaned.csv` (column `original_token_id`), but the contract mints sequential IDs `1`–`21`.

### 6.3 Pinning

- If the cleaned JSONs are byte-for-byte identical to the already-pinned versions, reuse the existing JSON folder CID from the CSV.
- Otherwise, upload the `metadata/` folder to Pinata/IPFS and record the new folder CID.
- The contract `baseURI` will be `ipfs://<json-folder-cid>/`.

---

## 7. Smart Contract

### 7.1 Dependencies

- `openzeppelin-contracts` v5.x: `ERC721`, `ERC721Pausable`, `ERC2981`, `Ownable`, `ReentrancyGuard`.
- Foundry for compilation, testing, and deployment scripts.
- Solidity `^0.8.27`.

### 7.2 Contract name

`ArtisticAuras.sol`

### 7.3 State

```solidity
uint256 public constant MAX_SUPPLY = 21;
uint256 public constant MINT_PRICE = 0.04 ether;
uint96 public constant ROYALTY_BASIS_POINTS = 500; // 5%
bool public publicSaleActive;
string private _baseTokenURI;
uint256 private _tokenIds;   // current total minted / last sequential token ID
```

Token IDs are sequential `1`–`21`, mapping directly to `metadata/<id>.json`.

### 7.4 User functions

- `mint(uint256 quantity) payable`
  - Reverts with `"Public sale is not active"` if `publicSaleActive` is false.
  - Reverts with `"Quantity must be greater than zero"` if `quantity == 0`.
  - Reverts with `"Incorrect payment amount"` if `msg.value != quantity * MINT_PRICE`.
  - Reverts with `"Max supply reached"` if `_tokenIds + quantity > MAX_SUPPLY`.
  - Reverts with `EnforcedPause()` when the contract is paused.
  - Protected by `nonReentrant` to prevent `_safeMint` callback exploits.
  - Mints sequential token IDs to `msg.sender`.

### 7.5 Owner functions

- `setBaseURI(string calldata baseURI)` — update metadata folder URI.
- `setPublicSaleActive(bool active)` — enable or disable public minting.
- `setDefaultRoyalty(address receiver, uint96 feeNumerator)` — update default royalty (basis points).
- `setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)` — set per-token royalty override.
- `pause()` / `unpause()` — emergency pause inherited from OpenZeppelin `ERC721Pausable`; blocks all transfers and mints while paused.
- `mintToAddress(address to, uint256 quantity)` — owner-only reserve mint, bypasses sale state and payment; protected by `nonReentrant`.
- `withdraw()` — sends the full contract ETH balance to `owner()`; protected by `nonReentrant`.
- `transferOwnership(address newOwner)` — inherited from OpenZeppelin `Ownable`.

### 7.6 Royalties

Use OpenZeppelin `ERC2981`. Constructor calls `_setDefaultRoyalty(owner(), 500)` (5%). `royaltyInfo(tokenId, salePrice)` returns the configured receiver and amount. Token IDs are ignored by the default royalty because it is collection-wide.

### 7.7 Errors

String-based require reverts:
- `"Public sale is not active"`
- `"Quantity must be greater than zero"`
- `"Incorrect payment amount"`
- `"Max supply reached"`
- `"No funds to withdraw"`
- `"Withdrawal failed"`

OpenZeppelin built-in:
- `EnforcedPause()` when transfers/mints are paused.
- `ReentrancyGuardReentrantCall()` for reentrant calls.

### 7.8 Token URI

`_baseURI()` returns the IPFS folder CID. `tokenURI(tokenId)` calls `_requireOwned(tokenId)` and returns `string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"))` so each metadata file is resolved as `<cid>/<id>.json`.

---

## 8. Frontend

### 8.1 Stack

- Next.js 14 (App Router)
- React + TypeScript
- shadcn/ui components (`Button`, `Card`, `Dialog`, `Input`, `Skeleton`, `Toast`)
- Tailwind CSS
- RainbowKit + wagmi + viem

### 8.2 Pages

1. **Home / Mint page**
   - Hero section with collection branding.
   - Mint card showing: price, `getTotalSupply / MAX_SUPPLY`, quantity selector.
   - RainbowKit connect button and mint button.
   - Disabled states for: not connected, sale inactive, sold out, insufficient ETH.
2. **Gallery page**
   - Grid of all 21 tokens.
   - Each card shows the Pinata image and token name.
   - Links to OpenSea/Etherscan after mainnet.

### 8.3 Data flow

- `useReadContract` to fetch `MINT_PRICE`, `getTotalSupply`, `MAX_SUPPLY`, `publicSaleActive`.
- `useWriteContract` + `useWaitForTransactionReceipt` to call `mint(quantity)` with `value = quantity * MINT_PRICE`.
- `useBalance` to warn if the wallet has insufficient ETH.

### 8.4 Environment variables

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111 # Sepolia; switch to 1 for mainnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### 8.5 Responsiveness & UX

- Mobile-first layout using Tailwind.
- Toast notifications for pending, success, and error states.
- Loading skeletons while contract data is fetched.
- Clear error messages mapped from contract custom errors.

---

## 9. Deployment & Operations

### 9.1 Testnet (Sepolia)

1. Run cleanup script and generate `metadata/` JSONs.
2. Pin/re-pin metadata folder to Pinata/IPFS.
3. Run Foundry deploy script on Sepolia:
   - `forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify --account deployer`
4. Confirm `METADATA_BASE_URI` points to the pinned metadata folder CID.
5. Verify contract source on Etherscan Sepolia.
6. Run frontend against Sepolia contract.
7. Test mints from multiple wallets and confirm metadata renders on OpenSea testnet.

### 9.2 Mainnet

1. Re-run the same deploy script on Ethereum mainnet:
   - `forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC --broadcast --verify --account deployer`
2. Verify source on Etherscan mainnet.
3. Confirm `baseURI` matches the pinned metadata folder CID.
4. Transfer ownership to the client wallet:
   - `transferOwnership(<client-address>)`
5. Withdraw any test ETH left in the contract before ownership transfer.
6. Update frontend env vars to mainnet `NEXT_PUBLIC_CHAIN_ID=1` and mainnet contract address.

### 9.3 Hosting

- Build the Next.js site as a static or server-rendered export.
- Hosting provider will be chosen by the client before launch; Vercel is recommended because it integrates well with Next.js.

---

## 10. Testing

### 10.1 Contract tests (Foundry)

- Mint with exact and incorrect ETH amounts.
- Mint up to `MAX_SUPPLY` and confirm the next mint reverts.
- Confirm minted token IDs match the CSV token IDs in order.
- Pause/unpause and public sale toggle behavior.
- Royalty info returns 5% and owner address.
- Withdraw sends full balance to owner.
- Ownership transfer works and old owner loses privileges.
- Fuzz tests on `quantity` and `msg.value` to ensure no supply/price invariants break.

### 10.2 Frontend tests

- Manual end-to-end test on Sepolia using a test wallet.
- Verify quantity * price math matches contract expectation.
- Verify transaction states and error toasts.

### 10.3 Metadata validation

- Script asserts every CSV row has a matching image file.
- Script asserts all JSON files are valid and contain required fields.
- Script asserts no duplicate token IDs.

---

## 11. Security Checklist

- All admin functions restricted by `onlyOwner`.
- Minting blocked by `Pausable` in emergencies.
- No arbitrary external calls during `withdraw`.
- Mint price is a fixed `0.04 ether` constant; frontend reads `MINT_PRICE` from the contract.
- Metadata pinned before `baseURI` is set so no broken links at launch.
- Contract ownership transferred to the client after mainnet deployment.

---

## 12. Open Decisions / Client Inputs

| Decision | Current state |
|----------|---------------|
| Hosting provider | Client to choose before launch; Vercel recommended |
| Client wallet address | Required before mainnet ownership transfer |
| Final mint price | `0.04 ether` per token (fixed) |
| External URL in metadata | Add project website URL if one exists |

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| CSV/image mismatches break metadata | Automated cleanup + validation script |
| Mainnet deploy costs spike | Deploy on testnet first, use a simple contract |
| Front-running or gas wars | Fixed price, unlimited per wallet; supply is tiny so organic demand expected |
| Client loses owner wallet | Transfer ownership only to a wallet the client controls and has backed up |
| Pinata CID changes | Re-pin metadata only if cleanup alters JSON content; verify before launch |

---

## 14. Acceptance Criteria

- [ ] Cleanup script runs successfully and all 21 images match CSV rows.
- [ ] 21 valid JSON metadata files exist and are pinned to IPFS/Pinata.
- [ ] Contract deploys on Sepolia and passes all Foundry tests.
- [ ] Frontend mints a token on Sepolia and displays correct metadata.
- [ ] Contract deploys on Ethereum mainnet and is verified on Etherscan.
- [ ] Ownership is transferred to the client wallet.
- [ ] Minting 21 tokens at `0.04 ether` each fills the total supply and sends `0.84 ETH` to the contract.
- [ ] OpenSea/Blur renders collection metadata and royalty info correctly.
