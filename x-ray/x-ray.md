# X-Ray Report

> Artistic Auras | 87 nSLOC | 791c072 (`master`) | Foundry | 16/07/26

---

## 1. Protocol Overview

**What it does:** A fixed-supply ERC-721 NFT collection that lets the public mint up to 21 sequential tokens when the owner turns on the sale, while the owner can reserve-mint, withdraw proceeds, pause activity, and update metadata/royalty endpoints.

- **Users**: Public minters and secondary-marketplaces that query royalties/token URIs.
- **Core flow**: A user sends `0.04 ETH × quantity` to `ArtisticAuras.mint()` while the public sale is active and the contract is not paused.
- **Key mechanism**: Sequential token IDs (`1..21`) with a single mutable `baseURI` and owner-controlled sale/pause toggles.
- **Token model**: ERC-721 “AURA” tokens; no fungible token or vault mechanics.
- **Admin model**: A single `Ownable` owner controls sale state, metadata URI, royalties, pausing, reserve minting, and fund withdrawal.

For a visual overview of the protocol's architecture, see the [architecture diagram](architecture.svg).

### Contracts in Scope

| Subsystem | Key Contracts | nSLOC | Role |
|-----------|--------------|------:|------|
| Minting & Metadata | `ArtisticAuras` | 87 | ERC-721 collection with owner-configurable sale, pause, royalties, and metadata URI. |

### How It Fits Together

The core trick: the contract is a thin policy layer over OpenZeppelin ERC-721 that only enforces supply and payment rules; all other behavior is delegated to the inherited OZ contracts and the owner.

```
Public Mint
├─ User calls ArtisticAuras.mint(quantity)
│  ├─ whenNotPaused                      (OZ Pausable)
│  ├─ whenPublicSaleActive               (owner-set flag)
│  ├─ require quantity > 0
│  ├─ require msg.value == MINT_PRICE * quantity
│  ├─ require _tokenIds + quantity <= MAX_SUPPLY
│  └─ _safeMint to msg.sender            (OZ ERC-721, callback fires)
└─ ETH accumulates in contract balance

Owner Reserve Mint
├─ Owner calls ArtisticAuras.mintToAddress(to, quantity)
│  ├─ onlyOwner
│  ├─ require _tokenIds + quantity <= MAX_SUPPLY
│  └─ _safeMint to `to`

Owner Withdraw
├─ Owner calls ArtisticAuras.withdraw()
│  ├─ onlyOwner
│  ├─ require address(this).balance > 0
│  └─ (bool success,) = payable(owner()).call{value: balance}("")

Owner Configuration
├─ setPublicSaleActive(bool)
├─ setBaseURI(string)
├─ setDefaultRoyalty(receiver, feeNumerator)
├─ setTokenRoyalty(tokenId, receiver, feeNumerator)
├─ pause() / unpause()
```

---

## 2. Threat & Trust Model

### Protocol Threat Profile

> Protocol classified as: **NFT / ERC-721 minting contract**.

The dominant risks are owner-key compromise (all admin powers are instant and unilateral) and off-chain metadata/royalty mutability, rather than lending/DEX-style oracle or AMM manipulation.

### Actors & Adversary Model

| Actor | Trust Level | Capabilities |
|-------|-------------|--------------|
| Owner | Bounded (single EOA/multisig; no timelock) | Instant: withdraw all ETH, pause/unpause, reserve-mint, change `baseURI`, change default/per-token royalty receiver and rate. Can also transfer ownership. |
| Deployer | Transient | Receives `Ownable` in constructor; expected to transfer to client wallet. Per spec, client wallet must be backed up. (per spec) |
| Public Minter | Permissionless (when sale active, not paused) | Pays exact ETH to mint; receives NFT via `_safeMint` callback. |
| OpenZeppelin Contracts | Trusted dependency (submodule) | Provides ERC-721, Pausable, ERC-2981, Ownable, ReentrancyGuard semantics. |

**Adversary Ranking** (ordered by threat level for this protocol type):

1. **Compromised owner / deployer** — A single owner key can drain ETH, alter metadata, change royalties to 100%, pause transfers, and mint the entire supply to themselves.
2. **Off-chain metadata failure** — `baseURI` can be changed at will; if the owner or Pinata/IPFS bucket is compromised, marketplaces return attacker-controlled metadata for existing tokens. (per spec)
3. **MEV / front-running minter** — Public sale opens globally; high-demand drops may see gas auctions, but fixed price and no per-wallet cap remove some common first-come patterns. (per spec)
4. **Reentrancy/callback abuser** — `_safeMint` calls the recipient's `onERC721Received`; `withdraw` sends ETH to the owner. Both entry points are guarded by `nonReentrant`, but the recipient hook remains an external call surface.

### Trust Boundaries

- **Owner ↔ Contract** — Owner has instant, unilateral control over all operational and economic parameters. No timelock, multisig requirement, or pause-delay exists. This is the single highest-value boundary.
- **Contract ↔ OpenZeppelin** — Inherits battle-tested access, pause, reentrancy, and ERC-2981 semantics. Submodule is a standard upstream fork; pragma mismatches exist across the broad OZ bundle but the core contracts (`ERC721`, `ERC2981`, `Pausable`, `ReentrancyGuard`, `Ownable`) use `^0.8.20`/`^0.8.27`.
- **Contract ↔ IPFS/Pinata** — Token metadata lives off-chain; `tokenURI()` concatenates the mutable `baseURI` with `tokenId.json`. Contract cannot verify availability or integrity of the JSON. (per spec)

### Key Attack Surfaces

- **Owner-key compromise / centralization** — All privileged functions execute instantly. The owner can extract the full contract balance, set royalties to the maximum OZ allows, and redirect every token's metadata URI. No timelock or operational pause is applied to `withdraw`, `mintToAddress`, `setBaseURI`, or royalty setters. `ArtisticAuras.sol:58-87`

- **Supply cap enforcement** &nbsp;&#91;[I-1](invariants.md#i-1), [G-4](invariants.md#g-4)&#93; — `_tokenIds + quantity <= MAX_SUPPLY` in `mint` and `mintToAddress` is the only guard against exceeding 21 tokens. `ArtisticAuras.sol:39,49`

- **Pause-coverage gap on privileged value flows** — `mintToAddress` and `withdraw` are not gated by `whenNotPaused`; an owner can reserve-mint and withdraw even while public mints/transfers are paused. `ArtisticAuras.sol:48,82`

- **Exact-payment design and no refund path** &nbsp;&#91;[G-3](invariants.md#g-3)&#93; — `msg.value == MINT_PRICE * quantity` reverts any overpayment. Worth confirming the frontend always builds the exact amount and that users cannot lose ETH through wallet copy-paste errors. `ArtisticAuras.sol:38`

- **Mutable metadata URI** — `setBaseURI` lets the owner change `tokenURI()` for all tokens at any time. Off-chain availability and integrity depend on the owner/Pinata. `ArtisticAuras.sol:58-60`

- **Royalty mutability up to 100%** — The owner can set default or per-token royalty to `feeNumerator == _feeDenominator()` (10 000 bp). OpenZeppelin caps at 100%, but the spec states a 5% default. `ArtisticAuras.sol:66-72` (per spec)

- **Callback surface on `_safeMint`** — Every mint triggers `onERC721Received` on the recipient. `nonReentrant` is present, but worth confirming the reentrancy guard covers the desired cross-function invariants. `ArtisticAuras.sol:36,43`

### Protocol-Type Concerns

**As an NFT / ERC-721 minting contract:**

- **Fixed supply relies on a single counter.** `_tokenIds` is the only supply accounting; it is incremented only in `mint` and `mintToAddress`, both capped by `MAX_SUPPLY`. No burn function exists, so supply is monotonic. `ArtisticAuras.sol:14,36-55`
- **Metadata is fully off-chain and mutable.** Secondary-market pricing and rarity depend on the JSON served at `baseURI + tokenId + ".json"`. The contract does not pin or hash the metadata; trust is entirely on the owner and Pinata/IPFS. `ArtisticAuras.sol:22,94-100` (per spec)
- **ERC-2981 is only a signal.** Marketplaces voluntarily honor `royaltyInfo()`; the contract cannot enforce royalty payments on-chain. `ArtisticAuras.sol:66-72,103-105`

### Temporal Risk Profile

**Deployment & Initialization:**

- **Owner seat starts with deployer.** Constructor sets `Ownable(msg.sender)`; the deployer must transfer ownership to the client wallet. Until that transfer happens, the deployer key controls the contract. `ArtisticAuras.sol:26` (per spec)
- **Public sale starts inactive.** `publicSaleActive` defaults to `false`; the owner must explicitly call `setPublicSaleActive(true)`. If the owner key is unavailable after deployment, the public sale never opens. `ArtisticAuras.sol:20,62-64`
- **No initialization beyond constructor.** There is no UUPS proxy or post-deployment `initialize()`; front-running concerns are limited to sniping the first public mint when the sale toggles on.

### Composability & Dependency Risks

**Dependency Risk Map:**

> **OpenZeppelin Contracts v5.x** — via inheritance (`ERC721`, `ERC721Pausable`, `ERC2981`, `Ownable`, `ReentrancyGuard`)
> - Assumes: inherited access control, pause semantics, reentrancy guard, ERC-2981 math, and `_safeMint` callbacks behave as documented.
> - Validates: no explicit runtime validation of OZ behavior in `ArtisticAuras`.
> - Mutability: Vendored submodule; can be updated by the repo maintainer, but core contracts are standard upstream.
> - On failure: Inherited reverts bubble up (e.g., `ERC721NonexistentToken`, `EnforcedPause`, `ReentrancyGuardReentrantCall`).

> **ETH owner transfer (`withdraw`)** — `payable(owner()).call{value: balance}("")`
> - Assumes: `owner()` is a payable address that accepts ETH.
> - Validates: `require(balance > 0)` and `require(success)`.
> - Mutability: Owner can be changed via `transferOwnership`/`acceptOwnership`.
> - On failure: Reverts if the owner rejects the call.

> **IPFS / Pinata metadata** — read by off-chain marketplaces via `tokenURI()`
> - Assumes: `baseURI` resolves to a directory containing `1.json` … `21.json` and each file remains available and unmodified.
> - Validates: None; contract cannot verify metadata integrity.
> - Mutability: Off-chain; owner can change `baseURI` at any time.
> - On failure: Marketplaces get 404 or stale JSON. (per spec)

> **ERC-2981 marketplaces** — callers of `royaltyInfo()`
> - Assumes: Marketplaces honor the returned `(receiver, amount)`.
> - Validates: None; standard only signals royalty information.
> - Mutability: Owner can change receiver/fee at any time.
> - On failure: No on-chain enforcement of royalty payment.

**Token Assumptions:**

- Only native ETH is accepted. No ERC-20 or ERC-777 tokens are handled, so fee-on-transfer/rebasing token risks do not apply.

---

## 3. Invariants

> ### 📋 Full invariant map: **[invariants.md](invariants.md)**
>
> - **6 Enforced Guards** (`G-1` … `G-6`)
> - **1 Inferred Single-Contract Invariant** (`I-1`)
> - **0 Cross-Contract Invariants**
> - **0 Economic Invariants**
>
> The single inferred invariant is on-chain = **Yes**. See `invariants.md` for the complete catalog and derivation.

---

## 4. Documentation Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| README | Present | `README.md` describes project, usage, and deployment commands. |
| NatSpec | Sparse | No contract-level or function-level `///` annotations in `ArtisticAuras.sol`. Enumeration reports 1 NatSpec-like comment, but it is not an explanatory annotation. |
| Spec/Whitepaper | Present | `docs/superpowers/specs/2026-07-13-artistic-auras-nft-launch-design.md` contains design decisions, economic parameters, and trust assumptions. (per spec) |
| Inline Comments | Adequate | Constants are annotated (e.g., `// 5%`); modifier and event names are self-describing. |

---

## 5. Test Analysis

| Metric | Value | Source |
|--------|-------|--------|
| Test files | 1 | File scan (`test/ArtisticAuras.t.sol`) |
| Test functions | 27 | File scan |
| Line coverage (src) | 100.00% (47/47) | `forge coverage` |
| Branch coverage (src) | 92.86% (13/14) | `forge coverage` |

### Test Depth

| Category | Count | Contracts Covered |
|----------|-------|-------------------|
| Unit | 27 | `ArtisticAuras` |
| Integration | 0 | — |
| Fork | 0 | — |
| Stateless Fuzz | 0 | — |
| Stateful Fuzz (Foundry) | 0 | — |
| Stateful Fuzz (Echidna) | 0 | — |
| Stateful Fuzz (Medusa) | 0 | — |
| Formal Verification (Certora) | 0 | — |
| Formal Verification (Halmos) | 0 | — |
| Formal Verification (HEVM) | 0 | — |

### Gaps

- No stateful fuzzing or formal verification. The contract is small (87 nSLOC) and unit coverage is high, but privileged-owner flows and mutable metadata/royalty transitions are only tested at the unit level.
- No fork tests (not relevant for a standalone minting contract, but deployment configuration is untested on a live network).

---

## 6. Developer & Git History

> Repo shape: `normal_dev` — single developer, 18 commits over 9 days (2026-07-07 → 2026-07-16), 8 of which touch source files.

### Contributors

| Author | Commits | Source Lines (+/-) | % of Source Changes |
|--------|--------:|--------------------|--------------------:|
| Youssef Hossam | 18 | +167 / -53 | 100% |

### Review & Process Signals

| Signal | Value | Assessment |
|--------|-------|------------|
| Unique contributors | 1 | Single developer — no peer-review signal from commit authorship. |
| Merge commits | 0 of 18 (0%) | No merge commits — likely direct commits or fast-forward merges; no formal review gate visible. |
| Repo age | 2026-07-07 → 2026-07-16 | 9 days; late burst of source changes immediately before this review. |
| Recent source activity (30d) | 8 commits | Active / late burst. |

### File Hotspots

| File | Modifications | Note |
|------|--------------:|------|
| `src/ArtisticAuras.sol` | 8 | Every source-touching commit modified the only in-scope contract. |

### Security-Relevant Commits

| SHA | Date | Subject | Score | Key Signal |
|-----|------|---------|------:|------------|
| 791c072 | 2026-07-16 | security: harden contract and expand test coverage | 24 | explicit security language; adds runtime guards; tightens access control; changes token/fund flow logic; includes test changes |
| 44c0f49 | 2026-07-16 | feat: add Pausable + public-sale toggle | 13 | feature addition; adds runtime guards; tightens access control; changes token/fund flow logic |
| 132c20f | 2026-07-14 | feat: add ArtisticAuras ERC-721 minting contract | 11 | feature addition; adds runtime guards; tightens access control; changes accounting/balance logic |
| e2dd950 | 2026-07-16 | refactor: remove per-wallet mint limit | 10 | removes a runtime guard; loosens access control |
| ac01b23 | 2026-07-16 | refactor: switch to sequential token IDs via baseURI | 9 | rewrites runtime guards; tightens access control; changes accounting/balance logic |
| 0369485 | 2026-07-16 | feat: add ERC-2981 5% royalty support | 8 | feature addition; tightens access control |
| ca707ad | 2026-07-14 | feat: add ArtisticAuras contract, tests, and deployment script | 5 | feature addition; spans security domains |

### Dangerous Area Evolution

| Security Area | Commits | Key Files |
|--------------|--------:|-----------|
| access_control | 8 | `src/ArtisticAuras.sol` |
| fund_flows | 8 | `src/ArtisticAuras.sol` |
| state_machines | 8 | `src/ArtisticAuras.sol` |

### Forked Dependencies

| Library | Path | Upstream | Status | Notes |
|---------|------|----------|--------|-------|
| openzeppelin-contracts | `lib/openzeppelin-contracts` | OpenZeppelin | Submodule | Standard upstream; some older OZ files have broader pragmas (`>=0.4.11` etc.), but the contracts actually used (`ERC721`, `ERC2981`, `Pausable`, `Ownable`, `ReentrancyGuard`) target `^0.8.20`/`^0.8.27`. |

### Technical Debt Markers

None detected.

### Security Observations

- **Single-developer dominance** — 100% of source changes come from one author; there is no commit-level peer-review signal.
- **Late burst** — 8 source-touching commits occurred within a 9-day window ending on the review date, including the highest-scoring security fix.
- **Owner powers are instant and broad** — No timelock, multi-sig, or operational pause is present in the only in-scope contract.
- **Dependency is a standard submodule** — OpenZeppelin is not internalized/modified; the main risk is submodule drift if not pinned to a release tag.

### Cross-Reference Synthesis

- **Single-dev + no merge commits + highest-scoring commit arriving on review day** → elevated process risk; the owner-centralization surface in Section 2 has no peer-review or timelock backstop.
- **All source changes touch the same 87 nSLOC file** → every new feature and hardening change interacts with the same access-control and fund-flow code paths; regressions in `ArtisticAuras.sol` affect the entire threat model.
- **Late removal of per-wallet mint cap (`e2dd950`)** → the `mint` surface was intentionally loosened; combined with unlimited quantity, the only remaining anti-griefing controls are payment exactness and supply cap.
- **Pausable introduced without pausing privileged mint/withdraw** → pause coverage is incomplete for owner-operated value flows, widening the operational window available to a compromised owner key.

---

## X-Ray Verdict

**FRAGILE** — Unit tests exist and cover the source contract well, but the protocol relies on a single instant owner with no timelock or multisig, has no stateful fuzzing or formal verification, and sparse NatSpec leaves most behavior undocumented on-chain.

**Structural facts:**
1. 87 nSLOC in one in-scope contract (`ArtisticAuras.sol`).
2. 27 Foundry unit tests; 100% line coverage and 92.86% branch coverage on the source contract.
3. One developer authored 100% of commits; zero merge commits.
4. Owner can instantly withdraw all ETH, change metadata URI, set royalties up to 100%, reserve-mint, and pause public mints/transfers.
5. No timelock, no multisig requirement, no stateful fuzzing, no formal verification, and no per-wallet mint cap.
