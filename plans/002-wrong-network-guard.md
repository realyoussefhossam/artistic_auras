# Plan 002: Add wrong-network guard and chain-aware URLs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat d37d258..HEAD -- app/lib/contract.ts app/app/wagmi.ts app/components/MintButton.tsx app/components/MintSuccessModal.tsx app/components/NFTModal.tsx app/lib/config.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: security, tech-debt
- **Planned at**: commit `d37d258`, 2026-07-19

## Why this matters

The wagmi config supports 16 chains, but the contract is only deployed on Sepolia (and eventually mainnet). If a user connects to Polygon, Arbitrum, or any other chain, `getContractAddress()` returns the Sepolia address for any non-mainnet chain — so all reads silently return nothing and the mint button sends a transaction to a non-existent contract on the wrong network. There is no error message or network-switch prompt. Additionally, Etherscan and OpenSea links are hardcoded to Sepolia URLs in 3 files, so they'll break on mainnet.

## Current state

### Contract address resolution

`app/lib/contract.ts` (full file, 14 lines):
```typescript
import abi from "./abi.json";
import { sepolia, mainnet } from "wagmi/chains";

export const contractABI = abi;

export const SEPOLIA_CONTRACT = "0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5";
const MAINNET_CONTRACT = "0x0000000000000000000000000000000000000000"; // TBD

export function getContractAddress(chainId: number): `0x${string}` {
  if (chainId === mainnet.id) return MAINNET_CONTRACT as `0x${string}`;
  return SEPOLIA_CONTRACT as `0x${string}`;
}

export { sepolia, mainnet };
```

The function returns the Sepolia address for ANY chain that isn't mainnet — including Polygon, Arbitrum, etc. This is the root cause of the wrong-network bug.

### Dead code in lib/config.ts

`app/lib/config.ts` (full file, 8 lines):
```typescript
import { sepolia, mainnet } from "wagmi/chains";

export const chains = [sepolia, mainnet] as const;

export const defaultChain =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 1 ? mainnet : sepolia;

export const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
```

Nothing imports from this file. The wagmi config in `app/app/wagmi.ts` defines its own chains and reads `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` directly. This file should be deleted.

### Hardcoded Sepolia URLs

1. `app/components/MintButton.tsx:151-159` — Etherscan link:
   ```typescript
   <a href={`https://sepolia.etherscan.io/tx/${hash}`} ...>
   ```

2. `app/components/MintSuccessModal.tsx:20-22` — Etherscan link:
   ```typescript
   const etherscanUrl = txHash
     ? `https://sepolia.etherscan.io/tx/${txHash}`
     : undefined;
   ```

3. `app/components/NFTModal.tsx:112-113` — OpenSea link:
   ```typescript
   href={`https://testnets.opensea.io/assets/sepolia/${SEPOLIA_CONTRACT}/${nft.tokenId}`}
   ```

### Wagmi config

`app/app/wagmi.ts` configures 16 chains (lines 79-97). The contract only exists on Sepolia (and eventually mainnet). The `sepolia` and `mainnet` chain objects are imported from `wagmi/chains` and have `.id` properties (sepolia.id = 11155111, mainnet.id = 1).

### RainbowKit usage

`app/app/providers.tsx` wraps the app in `RainbowKitProvider` but does not pass an `initialChain` prop. RainbowKit supports `initialChain` to prompt users to switch to the correct network.

### Repo conventions

- Hooks are in `app/hooks/read/` and `app/hooks/write/`, each exporting a single function.
- Components are in `app/components/`, using `"use client"` directive.
- Imports use `@/` path alias (maps to `app/`).
- TypeScript strict mode is enabled.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `cd app && npm install`          | exit 0              |
| Typecheck | `cd app && npx tsc --noEmit`     | exit 0, no errors   |
| Build     | `cd app && npm run build`        | exit 0, all routes generated |
| Lint      | `cd app && npm run lint`         | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `app/lib/contract.ts` — add chain validation + chain-aware URL helpers
- `app/app/wagmi.ts` — reduce to only sepolia + mainnet
- `app/app/providers.tsx` — add `initialChain` to RainbowKitProvider
- `app/components/MintButton.tsx` — use chain-aware Etherscan URL
- `app/components/MintSuccessModal.tsx` — use chain-aware Etherscan URL
- `app/components/NFTModal.tsx` — use chain-aware OpenSea URL
- `app/lib/config.ts` — DELETE (dead code)

**Out of scope** (do NOT touch):
- `app/hooks/` — hooks already work correctly, they receive `chainId` as a param
- `app/app/mint/page.tsx`, `app/app/gallery/page.tsx`, `app/app/page.tsx` — pages don't need changes
- `src/ArtisticAuras.sol` — no contract changes
- `app/.env.example` — the `NEXT_PUBLIC_CHAIN_ID` var is dead code being removed, no env changes needed

## Git workflow

- Branch: `advisor/002-wrong-network-guard`
- Commit message style: conventional commits, e.g. `fix: add wrong-network guard and chain-aware URLs`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Update contract.ts with chain validation and URL helpers

Replace the entire contents of `app/lib/contract.ts` with:

```typescript
import abi from "./abi.json";
import { sepolia, mainnet } from "wagmi/chains";

export const contractABI = abi;

export const SEPOLIA_CONTRACT = "0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5";
const MAINNET_CONTRACT = "0x0000000000000000000000000000000000000000"; // TBD

/** Chain IDs where the contract is deployed. */
export const SUPPORTED_CHAIN_IDS = [sepolia.id] as const;

export function isSupportedChain(chainId: number | undefined): boolean {
  if (chainId === undefined) return false;
  return SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number]);
}

export function getContractAddress(chainId: number): `0x${string}` {
  if (chainId === sepolia.id) return SEPOLIA_CONTRACT as `0x${string}`;
  if (chainId === mainnet.id) return MAINNET_CONTRACT as `0x${string}`;
  // Fall back to Sepolia for unknown chains — but callers should guard with isSupportedChain first.
  return SEPOLIA_CONTRACT as `0x${string}`;
}

/** Returns the Etherscan base URL for a given chain ID. */
export function getEtherscanUrl(chainId: number): string {
  if (chainId === mainnet.id) return "https://etherscan.io";
  return "https://sepolia.etherscan.io";
}

/** Returns the OpenSea asset URL for a token on a given chain ID. */
export function getOpenSeaAssetUrl(chainId: number, contractAddress: string, tokenId: number): string {
  if (chainId === mainnet.id) {
    return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
  }
  return `https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`;
}

export { sepolia, mainnet };
```

Key changes:
- `SUPPORTED_CHAIN_IDS` explicitly lists where the contract exists (only Sepolia for now — add mainnet.id when deployed).
- `isSupportedChain()` lets components check if the user is on the right network.
- `getEtherscanUrl()` and `getOpenSeaAssetUrl()` return the correct URL per chain.
- `getContractAddress()` no longer returns Sepolia address for ALL non-mainnet chains — it explicitly checks sepolia.id and mainnet.id, falling back to Sepolia only as a last resort.

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 2: Reduce wagmi chains to only sepolia + mainnet

In `app/app/wagmi.ts`, replace the entire file with a version that only includes sepolia and mainnet:

```typescript
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Transport } from "viem";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error(
    "WalletConnect project ID is not defined. Please check your environment variables.",
  );
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        ledgerWallet,
        rabbyWallet,
        coinbaseWallet,
        argentWallet,
        safeWallet,
      ],
    },
  ],
  { appName: "Artistic Auras", projectId: walletConnectProjectId },
);

const transports: Record<number, Transport> = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
};

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports,
  ssr: true,
});
```

This removes 14 unsupported chains (Polygon, Arbitrum, Optimism, Base, Avalanche, Linea, BSC and their testnets). Users can now only connect to Ethereum or Sepolia.

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 3: Add initialChain to RainbowKitProvider

In `app/app/providers.tsx`, import `sepolia` and pass `initialChain`:

Add this import near the top (after the existing wagmi imports):
```typescript
import { sepolia } from "wagmi/chains";
```

Then in the `RainbowKitProvider` JSX, add the `initialChain` prop:
```typescript
<RainbowKitProvider
  appInfo={appInfo}
  theme={darkTheme({
    accentColor: "#7c3aed",
    accentColorForeground: "#ffffff",
    borderRadius: "medium",
  })}
  initialChain={sepolia}
>
```

This tells RainbowKit to prompt users to switch to Sepolia when they connect.

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 4: Use chain-aware Etherscan URL in MintButton

In `app/components/MintButton.tsx`:

1. Add import for `getEtherscanUrl` (add after the existing `useMaxSupply` import or near other `@/lib` imports):
   ```typescript
   import { getEtherscanUrl } from "@/lib/contract";
   ```

2. Find the Etherscan link at the bottom of the component (around line 151-159):
   ```typescript
   <a
     href={`https://sepolia.etherscan.io/tx/${hash}`}
   ```
   Replace with:
   ```typescript
   <a
     href={`${getEtherscanUrl(chainId)}/tx/${hash}`}
   ```

   The `chainId` variable is already available in this component (line 21: `const chainId = useChainId();`).

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 5: Use chain-aware Etherscan URL in MintSuccessModal

In `app/components/MintSuccessModal.tsx`:

1. Add import:
   ```typescript
   import { getEtherscanUrl } from "@/lib/contract";
   import { useChainId } from "wagmi";
   ```

2. Inside the component function (after the props destructure, around line 14-19), add:
   ```typescript
   const chainId = useChainId();
   ```

3. Replace the hardcoded URL (lines 20-22):
   ```typescript
   // OLD:
   const etherscanUrl = txHash
     ? `https://sepolia.etherscan.io/tx/${txHash}`
     : undefined;
   ```
   With:
   ```typescript
   // NEW:
   const etherscanUrl = txHash
     ? `${getEtherscanUrl(chainId)}/tx/${txHash}`
     : undefined;
   ```

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 6: Use chain-aware OpenSea URL in NFTModal

In `app/components/NFTModal.tsx`:

1. Update the import from `@/lib/contract` (currently imports `SEPOLIA_CONTRACT`):
   ```typescript
   // OLD:
   import { SEPOLIA_CONTRACT } from "@/lib/contract";
   ```
   Replace with:
   ```typescript
   // NEW:
   import { getOpenSeaAssetUrl, getContractAddress } from "@/lib/contract";
   import { useChainId } from "wagmi";
   ```

2. Inside the component function (after line 42 `const paddedId = ...`), add:
   ```typescript
   const chainId = useChainId();
   ```

3. Replace the OpenSea link (around line 112-113):
   ```typescript
   // OLD:
   href={`https://testnets.opensea.io/assets/sepolia/${SEPOLIA_CONTRACT}/${nft.tokenId}`}
   ```
   Replace with:
   ```typescript
   // NEW:
   href={getOpenSeaAssetUrl(chainId, getContractAddress(chainId), nft.tokenId)}
   ```

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 7: Delete dead code in lib/config.ts

Delete the file `app/lib/config.ts` entirely. Nothing imports from it.

**Verify**: `cd app && npx tsc --noEmit` → exit 0 (confirm no import errors)

### Step 8: Build and lint

**Verify**:
- `cd app && npm run build` → exit 0, routes `/`, `/gallery`, `/mint` generated
- `cd app && npm run lint` → exit 0

## Test plan

No new automated tests (frontend has no test infrastructure yet — see plan 005). Verification is via build + typecheck + lint.

Manual verification:
- When connected to Sepolia: Etherscan links point to `sepolia.etherscan.io`, OpenSea links point to `testnets.opensea.io/assets/sepolia/...`
- When connected to an unsupported chain: RainbowKit should not list it (only Ethereum + Sepolia in the chain list)
- `app/lib/config.ts` should no longer exist

## Done criteria

- [ ] `cd app && npx tsc --noEmit` exits 0
- [ ] `cd app && npm run build` exits 0
- [ ] `cd app && npm run lint` exits 0
- [ ] `grep -rn "sepolia.etherscan.io" app/components/` returns no matches (hardcoded URL removed)
- [ ] `grep -rn "testnets.opensea.io" app/components/` returns no matches (hardcoded URL removed)
- [ ] `test ! -f app/lib/config.ts` succeeds (file deleted)
- [ ] `grep -n "SUPPORTED_CHAIN_IDS" app/lib/contract.ts` returns matches (new export exists)
- [ ] `grep -n "initialChain" app/app/providers.tsx` returns matches (RainbowKit configured)
- [ ] `grep -c "polygon\|arbitrum\|optimism\|base\|avalanche\|linea\|bsc" app/app/wagmi.ts` returns 0 (unsupported chains removed)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts (the codebase has drifted).
- `app/lib/config.ts` is imported by any file you didn't expect (check with `grep -rn "lib/config" app/` before deleting — if there are importers other than the file itself, STOP).
- A step's verification fails twice after a reasonable fix attempt.
- The `SEPOLIA_CONTRACT` address or chain configuration in `app/lib/contract.ts` doesn't match what's in the current state excerpts.

## Maintenance notes

- When the contract is deployed to mainnet, update `SUPPORTED_CHAIN_IDS` in `app/lib/contract.ts` to include `mainnet.id`, and set `MAINNET_CONTRACT` to the real address.
- The `initialChain` in providers.tsx should be changed from `sepolia` to `mainnet` when the mainnet launch happens.
- If more chains are added in the future (e.g., L2 deployments), add them to `wagmi.ts` chains array, `transports`, and `SUPPORTED_CHAIN_IDS` together — don't add a chain to wagmi without also adding it to the supported list.
