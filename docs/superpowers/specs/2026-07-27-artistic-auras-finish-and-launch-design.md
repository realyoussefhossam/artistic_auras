# Artistic Auras — Finish & Launch Design

**Date:** 2026-07-27
**Status:** Approved
**Supersedes parts of:** `2026-07-18-artistic-auras-frontend-design.md` (theme system, fonts, landing content, About page, portfolio aesthetic)
**Source of truth for bright theme:** `/home/youssefhossam/Downloads/valerio-lorenzo-DESIGN.md` and https://valeriolorenzo.vercel.app/
**Scope:** Contract `setMintPrice` + full frontend rebuild (dual theme, Geist, new landing content, About page with sourced SVG logo grid) + final data/metadata refresh + launch.

## Overview

Finish the Artistic Auras NFT project for launch. Three workstreams executed in order:

1. **Contract:** add an owner-settable mint price while keeping the canonical `MINT_PRICE` constant and the existing 21-piece supply.
2. **Frontend:** full rebuild of `app/` to match the Valerio Lorenzo artist-portfolio aesthetic (warm greige bright default + dark portfolio variant, Geist typography, flat 8px cards with soft shadows, indigo single-CTA), with rewritten landing copy, a new `/about` page, and theme-aware Mint/Gallery pages.
3. **Launch (last):** refresh/normalize all final metadata + artwork assets, re-pin to IPFS for a new CID, redeploy the contract to Sepolia then mainnet, wire the new addresses into the frontend, verify on OpenSea, then open the public sale.

The existing Sepolia deployment `0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5` becomes stale (storage layout changes from the new `mintPrice` state) and is superseded by fresh Sepolia + mainnet deployments at launch.

## Truthfulness decision

On-chain supply is **21** (`MAX_SUPPLY = 21`, 21 metadata JSONs, ~21 artwork PNGs). The client's reference copy describes a "500 meticulously crafted" collection, a "five-year odyssey," the Valerio Lorenzo artist bio, and a list of notable clients/collaborations. Per the owner's decision, the 500/five-year/Valerio narrative is **marketing storytelling**; the on-chain reality is 21. Concretely:

- Stats, Mint, and Gallery always reflect 21 (`MAX_SUPPLY()`, `getTotalSupply()`, `mintPrice()`).
- Landing marketing copy keeps the cosmic/five-year/Valerio storytelling but replaces "500" with "21" and avoids claiming a 500-piece mintable collection.
- About page presents Valerio Lorenzo's bio, journey, mission, and notable clients/collaborations as the artist's broader career (marketing), not as on-chain claims.

## Decisions

- **Contract:** keep `MINT_PRICE` constant; add mutable `mintPrice` used by `mint()`; add `setMintPrice` owner setter with a zero-price guard and event.
- **Frontend approach:** full rebuild (Approach A) — dual theme via `next-themes`, bright greige default, dark portfolio variant.
- **Pages:** Landing, Mint, Gallery, About. No Contact page.
- **Default theme:** bright (light), with toggle to dark.
- **Bright theme fidelity:** follow `valerio-lorenzo-DESIGN.md` literally — greige `#d1cdc7` canvas, grey `#9ca3af` fixed header, black text, white 8px cards with soft shadows, indigo `#6366f1` single CTA, Geist, flat. No glassmorphism, no glow, no gradient text, no WebGL aurora.
- **Dark theme:** dark portfolio variant — same flat language as bright, inverted onto a charcoal canvas. No glassmorphism, no aurora.
- **Fonts:** switch to Geist (single family, 400/700/800). Remove Space Grotesk / Inter / JetBrains Mono.
- **About page logos:** source SVG logos for the listed clients into `app/public/logos/` and render a theme-aware monochrome logo grid; fall back to styled text chips for any logo that cannot be sourced cleanly.
- **Launch:** refresh all final metadata + artwork, re-pin for a new CID, redeploy Sepolia + mainnet, update frontend addresses, verify on OpenSea, then open sale.

## Contract change — `setMintPrice`

### State & interface

- `uint256 public constant MINT_PRICE = 0.04 ether;` — **unchanged.** Remains the canonical default/initial price and an ABI getter.
- `uint256 public mintPrice;` — new public state variable, initialized in the constructor to `MINT_PRICE`.
- `event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);` — new event.
- `function setMintPrice(uint256 newMintPrice) external onlyOwner` — sets `mintPrice`, reverts on zero, emits `MintPriceUpdated`.
- `mint()` payment check changes from `MINT_PRICE` to `mintPrice`:
  `require(msg.value == mintPrice * quantity, "Incorrect payment amount");`
- No other contract behavior changes. `mintToAddress`, royalties, pause, withdraw, base URI, sale toggle all unchanged.

### Tests (Foundry)

Existing tests stay green because `mintPrice` is initialized to `MINT_PRICE`. New tests:

- `test_MintPriceInitializedToConstant` — `mintPrice() == MINT_PRICE()`.
- `test_SetMintPrice` — owner sets a new price; `mintPrice()` reflects it.
- `test_SetMintPriceEmitsEvent` — `MintPriceUpdated(old, new)` emitted with correct values.
- `test_SetMintPriceRevertsForNonOwner` — non-owner call reverts (OwnableUnauthorizedAccount).
- `test_SetMintPriceRevertsOnZero` — zero price reverts with "Mint price must be greater than zero".
- `test_MintUsesUpdatedPrice` — after `setMintPrice`, `mint()` accepts the new exact amount and rejects the old amount.

### Deploy script & frontend wiring

- `script/Deploy.s.sol` logs `mintPrice()` in addition to `MINT_PRICE()`.
- Frontend `useMintPrice` hook reads `mintPrice()` (mutable) instead of `MINT_PRICE()`. `MINT_PRICE()` remains in the ABI for backward compatibility but is no longer the source of truth for cost calculations.
- `app/lib/abi.json` is auto-copied from `out/` via the existing `postinstall` script, so the new ABI flows through automatically after `forge build`.

### Storage layout note

Adding `mintPrice` changes storage layout, so the existing Sepolia deploy is not upgradeable in place. It is superseded by a fresh deploy at launch (see Launch).

## Frontend — theme system

### Theme provider

- Add `next-themes` and wrap the app in a client `ThemeProvider` with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`.
- Remove the hardcoded `dark` class from `<html>` in `app/app/layout.tsx`; keep `suppressHydrationWarning` to avoid hydration flash.
- ThemeToggle (Sun/Moon icon button) in the header next to the RainbowKit `ConnectButton`.

### Compatibility check (before coding)

Per `app/AGENTS.md`, this is **Next.js 16 + React 19 + Tailwind v4** with breaking changes. Before writing theme code, read the relevant guide in `app/node_modules/next/dist/docs/` and confirm `next-themes` + Tailwind v4 `@theme inline` + `@custom-variant dark` compatibility. Heed any deprecation notices.

### Token structure

Restructure `app/app/globals.css` so semantic CSS vars flip per theme and `@theme inline` maps Tailwind utilities to them. Concrete tokens:

**Bright (`:root`):**
- `--canvas`: `#d1cdc7` (warm greige body background)
- `--surface`: `#ffffff` (cards)
- `--header`: `#9ca3af` (fixed header bar, cool grey)
- `--text`: `#000000` (primary text)
- `--text-secondary`: `#1f2937`
- `--text-muted`: `#4b5563`
- `--border`: `#e5e7eb`
- `--accent`: `#6366f1` (indigo, single CTA)
- `--accent-contrast`: `#ffffff`
- `--on-header`: `#ffffff` (nav link text on grey header)
- Card radius: `8px`; card shadow: soft `shadow-lg`-equivalent (`rgba(0,0,0,0.1) 0px 10px 15px -3px, rgba(0,0,0,0.1) 0px 4px 6px -4px`); header shadow: `rgba(0,0,0,0.1) 0px 4px 6px -1px, rgba(0,0,0,0.1) 0px 2px 4px -2px`.

**Dark (`.dark`):**
- `--canvas`: `#131318` (charcoal)
- `--surface`: `#1f1f25` (cards)
- `--header`: `#35343a` (dark grey)
- `--text`: `#e4e1e9`
- `--text-secondary`: `#ccc3d8`
- `--text-muted`: `#958da1`
- `--border`: `#4a4455`
- `--accent`: `#6366f1` (same indigo)
- `--accent-contrast`: `#ffffff`
- `--on-header`: `#e4e1e9`
- Same radius/shadow tokens, softened for dark (lower alpha).

Tailwind utilities to expose (via `@theme inline`): `bg-canvas`, `bg-surface`, `bg-header`, `text-primary`, `text-secondary`, `text-muted`, `border-default`, `bg-accent`, `text-accent-contrast`, `text-on-header`, plus `font-sans` mapped to Geist.

### Removals

- Remove `AuroraBackground` usage from layouts/pages (and delete the component file to keep the tree tidy).
- Remove glass utility classes (`glass-panel`, `glass-card-rounded`, `aura-hover`), `text-glow`, `gradient-accent`/`text-gradient`, and the dark-only radial-gradient body background.
- Remove `AuroraBackground` imports from `page.tsx` and any layout.
- Keep `custom-scrollbar`, fade-in animations, and status-pulse if still used; restyle them to flat tokens.

## Frontend — typography

- Switch `app/app/layout.tsx` to load **Geist** via `next/font/google` (or the `geist` package) with weights 400/700/800 and a single `--font-sans` variable.
- Remove `Space_Grotesk`, `Inter`, `JetBrains_Mono` imports and their CSS variables.
- Update `@theme inline` so `--font-sans`, `--font-heading`, `--font-mono` all map to Geist (single-family hierarchy per design.md).
- Type scale (from design.md): body 16px/24lh/400, body-small 18px/28lh/400, nav-link 20px/40lh/400, card-label 20px/28lh/700, card-title 20px/40lh/700, sub-heading 25px/40lh/700, section-heading 36px/40lh/800, large-heading-alt 36px/45lh/700.

## Frontend — pages

### Landing (`/`)

Theme-aware, flat portfolio aesthetic. Sections, top to bottom:

1. **Hero:** "Artistic Auras" title, "21 unique pieces" badge, subtitle adjusted to 21 ("A 21-piece abstract NFT collection capturing cosmic energy and vibrant expressionism. Claim your piece of the digital void."), indigo Mint CTA, Gallery link.
2. **StatsBar:** reads `mintPrice()`, `getTotalSupply()`, `MAX_SUPPLY()`; renders 21 supply, minted count, mint price, 5% royalty. Flat pill/card style, no glass.
3. **Overview:** the client's Overview paragraph with "500" → "21".
4. **Purpose:** the client's Purpose paragraph.
5. **Artistic Vision:** the client's Artistic Vision paragraph.
6. **The Concept:** Year 1–5 timeline (five rows/cards): The Spark of Creation, Exploring the Abstract Unknown, Harmony in Chaos, The Human Connection, The Masterpiece Converges. Each with its year label and description.
7. **Footer:** existing Footer component, restyled to flat tokens (text `#1f2937`/`#4b5563` in bright, muted in dark).

### About (`/about`) — new

1. **Hero:** "Valerio Lorenzo" name + intro paragraph ("Valerio Lorenzo is a boundary-breaking digital artist…").
2. **A Journey Rooted in Passion and Perseverance:** that section's paragraphs.
3. **A Visionary Approach to Digital Art:** that section's paragraphs.
4. **The Artist's Mission:** that section's paragraphs.
5. **Notable Clients and Collaborations:** responsive monochrome logo grid (see below).

### Mint (`/mint`)

Keep existing wagmi logic (`useMint`, `useMintPrice` reading `mintPrice()`, `useTotalSupply`, `useMaxSupply`, `usePublicSaleActive`, success modal). Restyle to flat portfolio: white 8px cards with soft shadows, indigo CTA, theme-aware. No glass/glow.

### Gallery (`/gallery`)

Keep existing logic (reads `tokenURI`/`ownerOf`, fetches IPFS metadata, NFTCard grid, NFTModal). Restyle cards to 8px radius, soft shadow, 4-column grid on desktop / 2-col tablet / 1-col mobile, theme-aware. No glass/glow.

### Navigation

Fixed full-width header (`--header` background, soft drop shadow). Left: "Artistic Auras" brand. Right: nav links (Landing / Mint / Gallery / About) in 20px white-on-grey (bright) or `--on-header` (dark), active link underline. ThemeToggle + RainbowKit `ConnectButton` at the far right. Mobile: hamburger menu.

## About page — logo sourcing

- Source **SVG** logos for the listed clients/collaborations into `app/public/logos/` from freely-available sources (Simple Icons, Wikimedia Commons, official brand kits where permitted). Target list:
  - Marvel, 2K Games, FX Network, National Geographic, The Clio Awards, The Atlantic, Washington Post, Criterion Collection
  - Stellar Foundation, The Astronomical Society, Obsidian Studios, World Art Biennale, Astralis Crypto Fund
  - SpaceX Art Initiative, Universal Music Group, Netflix Original Series, Warner Bros. Interactive
  - The Cosmic Perspectives Foundation, Humanity Forward Foundation, Museum of Digital Art (MoDA)
- Render as a responsive monochrome logo grid using `currentColor` so logos adapt to theme (dark ink on bright, light ink on dark). Uniform height, grayscale, hover can lift slightly.
- **Fallback:** any logo that cannot be sourced cleanly (no permissive SVG, trademark concerns) becomes a styled text chip with the entity name, so the grid is never broken. The implementation report will list which entries fell back to text.

## Contract integration changes

- `useMintPrice` reads `mintPrice()` (mutable) instead of `MINT_PRICE()`.
- `MintButton` cost calculation uses the mutable price.
- `StatsBar` uses the mutable price for the "Mint Price" stat.
- `app/lib/contract.ts` addresses updated at launch time (Sepolia + mainnet post-redeploy). Until then, the existing Sepolia address remains for dev; the ABI is refreshed automatically by `postinstall` after `forge build`.
- `useMaxSupply`, `useTotalSupply`, `usePublicSaleActive`, `useTokenURI`, `useOwnerOf`, `useMint` unchanged in logic.

## Verification

### Solidity
- `forge build`
- `forge test -vvv`
- `forge fmt --check`

### Frontend
- `cd app && npm run build`
- `cd app && npm run lint`
- Manual: both themes on every page (Landing, Mint, Gallery, About); toggle persists across navigation; no hydration flash; mint flow end-to-end on Sepolia; gallery loads all 21 cards; About logo grid renders with sourced SVGs + any text fallbacks; responsive at 640/768/1024/1280/1536.

## Launch (executed last, after sign-off + builds green)

Final data + metadata refresh, then deploy and open sale:

1. **Finalize metadata + artwork:** normalize/refresh `metadata/*.json` and the artwork assets via `scripts/cleanup_metadata.py` (operates on a temp copy of `special/special/` per project guardrails) so all 21 entries reflect the final, correct data.
2. **Pin:** run `scripts/pin_metadata.py` to pin the `metadata/` folder to Pinata/IPFS and obtain a new CID.
3. **Set `METADATA_BASE_URI`:** update `.env` so `METADATA_BASE_URI` points to the new pinned folder CID (must end with `/`).
4. **Redeploy Sepolia:** `source .env && forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify --account deployer -vvv`. Confirm `publicSaleActive()` is `false` by default and `baseURI()` matches the new CID.
5. **Smoke test on Sepolia:** mint one token via the frontend (or `cast`), confirm `tokenURI` resolves and OpenSea Sepolia renders metadata + image.
6. **Update frontend addresses:** set the new Sepolia + mainnet addresses in `app/lib/contract.ts`.
7. **Mainnet deploy:** same `forge script` against mainnet RPC, verify, smoke test.
8. **OpenSea check:** confirm collection metadata + royalties render on OpenSea for the deployed mainnet contract.
9. **Open the public sale:** call `setPublicSaleActive(true)` from the owner wallet on mainnet.
10. **Royalty/ownership guard:** before any `transferOwnership` on any network, either rely on the existing `_transferOwnership` sync (already fixed in-contract) or call `setDefaultRoyalty(newOwner, 500)` immediately after.

## Out of scope

- Automated frontend tests (Vitest/Playwright) — future phase.
- Contact page.
- Admin UI in the frontend — all admin ops via `cast` CLI or Etherscan.
- Timelock, multisig, or DAO mechanics.
- Expanding the collection beyond 21 on-chain pieces.
- Keeping the old Sepolia deployment active — it is superseded.
