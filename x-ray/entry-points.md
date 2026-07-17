# Entry Point Map

> Artistic Auras | 9 entry points | 1 permissionless | 0 role-gated | 8 admin-only

---

## Protocol Flow Paths

### Setup (Owner)

`deploy(baseURI)` → `setPublicSaleActive(true)`

### User Flow

`[owner toggles sale active]` → `ArtisticAuras.mint(quantity)`  ◄── exact `msg.value` and `quantity > 0` and supply cap

### Admin Flows

`[owner]` → `mintToAddress(to, quantity)`  ◄── reserve mint, bypasses payment/sale

`[owner]` → `setBaseURI(baseURI)` → updates `tokenURI()` for all tokens

`[owner]` → `setDefaultRoyalty(receiver, feeNumerator)` / `setTokenRoyalty(tokenId, receiver, feeNumerator)` → updates royalty signal

`[owner]` → `pause()` / `unpause()` → toggles `_paused`

`[owner]` → `withdraw()` → drains contract ETH balance

---

## Permissionless

### `ArtisticAuras.mint(uint256 quantity)`

| Aspect | Detail |
|--------|--------|
| Visibility | `external payable`, `nonReentrant` |
| Caller | Public minter |
| Parameters | `quantity (user-controlled)` — number of tokens to mint |
| Call chain | `mint()` → `_safeMint(msg.sender, _tokenIds)` → OZ `ERC721._mint` → recipient `onERC721Received` callback |
| State modified | `_tokenIds` += `quantity`; OZ `balanceOf`, `ownerOf`, `_totalMinted` |
| Value flow | ETH in: `msg.sender` → contract (`msg.value == MINT_PRICE * quantity`) |
| Reentrancy guard | yes (`nonReentrant`) |

---

## Role-Gated

None.

---

## Admin-Only

All restricted to `onlyOwner`.

| Contract | Function | Parameters | State Modified |
|----------|----------|------------|----------------|
| `ArtisticAuras` | `mintToAddress(address to, uint256 quantity)` | `to (user-controlled by owner)`, `quantity (user-controlled by owner)` | `_tokenIds` += `quantity`; OZ ownership/balance state |
| `ArtisticAuras` | `setBaseURI(string calldata baseURI)` | `baseURI (user-controlled by owner)` | `_baseTokenURI` |
| `ArtisticAuras` | `setPublicSaleActive(bool active)` | `active (user-controlled by owner)` | `publicSaleActive` |
| `ArtisticAuras` | `setDefaultRoyalty(address receiver, uint96 feeNumerator)` | `receiver (user-controlled by owner)`, `feeNumerator (user-controlled by owner)` | OZ `_defaultRoyaltyInfo` |
| `ArtisticAuras` | `setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)` | `tokenId (user-controlled by owner)`, `receiver`, `feeNumerator` | OZ `_tokenRoyaltyInfo[tokenId]` |
| `ArtisticAuras` | `pause()` | — | OZ `_paused` = true |
| `ArtisticAuras` | `unpause()` | — | OZ `_paused` = false |
| `ArtisticAuras` | `withdraw()` | — | contract ETH balance → 0 |

---

## Initialization

`constructor(string memory baseURI)` — one-time deployment entry point; sets name/symbol, `Ownable(msg.sender)`, `_baseTokenURI`, and default royalty. No proxy initialization pattern is used.
