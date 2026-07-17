# Artistic Auras Frontend Design

**Date:** 2026-07-18  
**Status:** Approved  
**Depends on:** `src/ArtisticAuras.sol` (deployed at `0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5` on Sepolia)

## Overview

A Next.js 14 frontend for the Artistic Auras NFT collection. Three pages: Landing, Mint, Gallery. No admin UI — all owner operations via `cast` CLI or Etherscan. Dark-themed, glassmorphism aesthetic with a WebGL aurora shader background.

## Decisions

- **Repo structure:** Monorepo — frontend lives in `web/` subdir of the existing repo
- **Networks:** Sepolia + Mainnet from day one, controlled by `NEXT_PUBLIC_CHAIN_ID` env var
- **Wallet connection:** RainbowKit + wagmi v2 + viem v2
- **Architecture:** Static pages + client-side contract reads/writes (Approach A)
- **Admin UI:** None — all admin operations via `cast` CLI or Etherscan
- **Component library:** shadcn/ui (new-york style, dark theme) for primitives
- **Deployment:** TBD — built to run locally for now, deployable anywhere later

## Project Structure

```
artistic_auras/
├── src/                        # Solidity contracts (existing)
├── test/                       # Foundry tests (existing)
├── script/                     # Deploy scripts (existing)
├── scripts/                    # Python metadata scripts (existing)
├── metadata/                   # NFT metadata JSONs (existing)
├── web/                        # Next.js frontend (new)
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing page
│   │   ├── mint/
│   │   │   └── page.tsx        # Mint page
│   │   └── gallery/
│   │       └── page.tsx        # Gallery page
│   ├── components/
│   │   ├── providers.tsx       # Wagmi + RainbowKit providers
│   │   ├── Header.tsx          # Nav + connect button
│   │   ├── MintButton.tsx      # Mint interaction logic
│   │   ├── NFTCard.tsx         # Gallery card
│   │   ├── NFTModal.tsx        # Detail modal
│   │   ├── AuroraBackground.tsx # WebGL shader
│   │   └── StatsBar.tsx        # Supply/price/royalty stats
│   ├── hooks/
│   │   ├── read/               # All useReadContract wrappers
│   │   │   ├── usePublicSaleActive.ts
│   │   │   ├── useTotalSupply.ts
│   │   │   ├── useMintPrice.ts
│   │   │   ├── useMaxSupply.ts
│   │   │   ├── useTokenURI.ts
│   │   │   └── useOwnerOf.ts
│   │   └── write/              # All useWriteContract wrappers
│   │       └── useMint.ts
│   ├── lib/
│   │   ├── contract.ts         # ABI + addresses per chain
│   │   ├── config.ts           # Network config (Sepolia/Mainnet)
│   │   ├── ipfs.ts             # IPFS gateway helpers
│   │   └── abi.json            # Auto-copied from Foundry out/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.local.example
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode, no `any`)
- Tailwind CSS
- wagmi v2 + viem v2
- RainbowKit
- shadcn/ui (new-york style, dark theme)
- Framer Motion (animations)
- next/font (Space Grotesk + Inter)

## ABI Sharing

A `postinstall` script in `web/package.json` copies the compiled ABI from `../out/ArtisticAuras.sol/ArtisticAuras.json` to `web/lib/abi.json`. No manual sync needed. The script runs automatically on `npm install`.

## Pages

### Landing (`/`)

- Hero section with "Artistic Auras" title, subtitle, aurora WebGL background
- Stats bar: 21 supply, 0.04 ETH price, 5% royalty (read from contract)
- "Connect Wallet" button in header (RainbowKit)
- "Mint Now" CTA → routes to `/mint`
- "View Gallery" link → routes to `/gallery`
- Footer with GitHub link

### Mint (`/mint`)

- Quantity selector (1–21, capped by remaining supply)
- Real-time cost calculation: `quantity × 0.04 ETH`
- Mint button with states: idle → pending → success → error
- Progress bar: `minted / 21` (reads `getTotalSupply()`)
- Sale status badge: reads `publicSaleActive()`
- Success modal after mint: shows token ID, image, "View on Etherscan" link
- Error handling: sale not active, sold out, insufficient funds, wrong network, rejected tx

### Gallery (`/gallery`)

- Grid of 21 NFT cards
- Each card fetches `tokenURI(id)` → IPFS metadata → image + name + traits
- Hover: zoom image, show trait badges
- Click: modal with full metadata (name, description, all attributes, large image)
- "Not minted" cards show a placeholder silhouette
- Filter bar: filter by trait (Color Scheme, Energy Source, Mood, etc.)

### No Admin Page

All admin operations (toggle sale, set base URI, set royalties, pause/unpause, withdraw, mint to address) are done via `cast` CLI or Etherscan. The frontend is purely user-facing.

## Contract Integration

### Contract config (`web/lib/contract.ts`)

- ABI imported from `web/lib/abi.json`
- Contract addresses per chain:
  ```ts
  const CONTRACTS = {
    11155111: "0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5", // Sepolia
    1: "0x0000000000000000000000000000000000000000",        // Mainnet (TBD)
  }
  ```

### Contract reads (`hooks/read/`)

| Hook | Function | Where used | Purpose |
|------|----------|-----------|---------|
| `usePublicSaleActive` | `publicSaleActive()` | Mint page | Show sale status badge |
| `useTotalSupply` | `getTotalSupply()` | Mint + Landing | Progress bar, "X/21 minted" |
| `useMintPrice` | `MINT_PRICE()` | Mint page | Cost calculation |
| `useMaxSupply` | `MAX_SUPPLY()` | Mint + Landing | Supply display |
| `useTokenURI` | `tokenURI(id)` | Gallery | Fetch per-token metadata |
| `useOwnerOf` | `ownerOf(id)` | Gallery | Check if token is minted |

### Contract writes (`hooks/write/`)

| Hook | Function | Where used | Purpose |
|------|----------|-----------|---------|
| `useMint` | `mint(uint256 quantity)` | Mint page | Public mint, payable 0.04 ETH × qty |

### IPFS metadata fetching (`web/lib/ipfs.ts`)

- `tokenURI()` returns `ipfs://<cid>/<id>.json`
- Convert `ipfs://` to HTTPS gateway: `https://gateway.pinata.cloud/ipfs/<cid>/<id>.json`
- Fetch JSON → extract `name`, `description`, `image`, `attributes`
- Convert `image` field from `ipfs://` to HTTPS gateway for `<img>` src
- Cache responses in memory to avoid refetching
- Fallback gateway: `ipfs.io` if Pinata gateway fails

### Network switching

- RainbowKit configured with Sepolia + Mainnet
- If user is on wrong network, show a "Switch to Sepolia" prompt
- Mint button disabled until on correct network
- `NEXT_PUBLIC_CHAIN_ID` env var controls default target network

### Event listening

- After mint tx confirms, read the `NFTMinted` event from the receipt logs to get the token ID
- Show token ID + image in success modal

## Styling & Visual Design

### Theme

- Background: `#0a0a0f` (near-black)
- Cards: `#1a1a2e` with `rgba(255,255,255,0.05)` glassmorphism overlay
- Borders: `rgba(255,255,255,0.1)` subtle
- Accent gradient: purple `#7c3aed` → pink `#ec4899` → gold `#f59e0b`

### Typography

- Headings: Space Grotesk (Google Font, via `next/font`)
- Body: Inter (Google Font, via `next/font`)

### shadcn/ui components

- `Button` — mint button, CTAs, connect wallet trigger
- `Dialog` — NFT detail modal, mint success modal
- `Input` — quantity selector
- `Badge` — trait badges, sale status indicator
- `Toast` (sonner) — transaction notifications (pending, success, error)
- `Tooltip` — trait info on hover

shadcn/ui CSS variables overridden in `globals.css`:
```css
--background: 240 10% 4%;        /* #0a0a0f */
--card: 240 10% 12%;             /* #1a1a2e */
--primary: 265 89% 62%;          /* #7c3aed */
--accent: 330 81% 60%;           /* #ec4899 */
```

### Custom components (not shadcn)

- `AuroraBackground` — WebGL fragment shader with flowing purple/pink/gold waves, fixed position, paused when tab not visible, CSS gradient fallback
- `NFTCard` — custom layout for gallery grid
- `StatsBar` — pill-shaped glass chips

### Animations (Framer Motion)

- Page transitions: fade + slide
- NFT cards: stagger fade-in on gallery load
- Mint button: scale on tap, glow pulse on hover
- Success modal: scale + fade in

### Responsive

- Mobile: single column gallery, stacked hero, hamburger menu
- Tablet: 2-column gallery
- Desktop: 3-column gallery, full nav bar

## Error Handling & Edge Cases

### Wallet errors

- No wallet connected → mint button shows "Connect Wallet" instead of "Mint"
- Wrong network → toast: "Switch to Sepolia to mint" + button to switch
- Transaction rejected → toast: "Transaction cancelled"
- Insufficient funds → toast: "Insufficient ETH for mint + gas"

### Contract errors

- Sale not active → mint button disabled, badge shows "Sale Paused"
- Sold out → mint button disabled, shows "Sold Out"
- Quantity exceeds remaining supply → input capped at `MAX_SUPPLY - getTotalSupply()`
- Contract paused → same as sale inactive

### IPFS errors

- Metadata fetch timeout (10s) → NFT card shows "Metadata loading…" with retry
- Image fetch fails → fallback placeholder with token ID
- Gateway down → retry with secondary gateway (`gateway.pinata.cloud` → `ipfs.io`)

### Transaction states (Mint button)

1. Idle → "Mint NFT"
2. Pending → spinner + "Confirming…" (disabled)
3. Success → modal with NFT image + "View on Etherscan"
4. Error → toast with error message, button back to idle

## Testing & Verification

No automated frontend tests in this phase. Manual verification checklist:

1. Landing page loads, aurora shader renders, stats show correct values
2. Connect wallet button opens RainbowKit modal
3. Switching to Sepolia shows correct network indicator
4. Mint page: quantity selector works, cost updates in real-time
5. Mint with 1 NFT → transaction confirms → success modal shows correct token ID + image
6. Mint with invalid quantity (0, >remaining) → button disabled
7. Gallery: all 21 cards render, minted ones show images, unminted show placeholder
8. Gallery: click card → modal shows full metadata + traits
9. Gallery: filter by trait works
10. Mobile: all pages responsive, hamburger menu works
11. Wrong network → toast prompt to switch
12. Disconnect wallet → mint button reverts to "Connect Wallet"

### Build verification

- `npm run build` passes with no errors
- `npm run lint` passes
- TypeScript strict mode, no `any` types
- Bundle size < 500KB (excl. fonts)

## Out of Scope

- Admin UI (all admin via `cast` CLI or Etherscan)
- Automated frontend tests (Vitest, Playwright — future phase)
- Mainnet contract address (TBD before mainnet launch)
- Deployment platform (TBD — built to run locally for now)
- Finding #1 fix (royalty receiver desync — separate contract change before mainnet)
