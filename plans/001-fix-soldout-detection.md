# Plan 001: Fix sold-out detection in MintButton

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat d37d258..HEAD -- app/components/MintButton.tsx`
> If this file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `d37d258`, 2026-07-19

## Why this matters

The MintButton's "Sold Out" state never triggers because it checks if `maxSupply === 0` instead of `totalSupply === maxSupply`. Since MAX_SUPPLY is 21 (never 0), the sold-out check is always false. Users can click "Mint NFT" when all 21 tokens are already minted, and they get a confusing contract revert ("Max supply reached") instead of a clean "Sold Out" button state. This also means users waste gas on a doomed transaction.

## Current state

The file `app/components/MintButton.tsx` contains the mint UI. The relevant bug is at lines 36-38:

```typescript
// app/components/MintButton.tsx:36-38
const saleNotActive = saleActive === false;
const soldOut =
  maxSupply !== undefined && maxSupply !== null && BigInt(maxSupply as bigint) === BigInt(0);
```

The `soldOut` check compares `maxSupply` to `0`. But `maxSupply` is the constant 21 (from the contract's `MAX_SUPPLY()`). It should instead compare `totalSupply` to `maxSupply`.

The hook `useTotalSupply` already exists and is used in the mint page (`app/app/mint/page.tsx:11,18`). It reads the contract's `getTotalSupply()` function.

The hook is at `app/hooks/read/useTotalSupply.ts`:
```typescript
// app/hooks/read/useTotalSupply.ts
import { useReadContract } from "wagmi";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useTotalSupply(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "getTotalSupply",
  });
}
```

The existing imports in MintButton.tsx (lines 1-11):
```typescript
import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { formatEther, parseEther } from "viem";
import { toast } from "sonner";
import { Minus, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useMint } from "@/hooks/write/useMint";
import { usePublicSaleActive } from "@/hooks/read/usePublicSaleActive";
import { useMintPrice } from "@/hooks/read/useMintPrice";
import { useMaxSupply } from "@/hooks/read/useMaxSupply";
```

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `cd app && npm install`          | exit 0              |
| Typecheck | `cd app && npx tsc --noEmit`     | exit 0, no errors   |
| Build     | `cd app && npm run build`        | exit 0, all routes generated |
| Lint      | `cd app && npm run lint`         | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `app/components/MintButton.tsx`

**Out of scope** (do NOT touch):
- `app/hooks/read/useTotalSupply.ts` — already works correctly
- `app/hooks/read/useMaxSupply.ts` — already works correctly
- Any other component or page

## Git workflow

- Branch: `advisor/001-fix-soldout-detection`
- Commit message style: conventional commits, e.g. `fix: correct sold-out detection in MintButton`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add useTotalSupply import and hook call

In `app/components/MintButton.tsx`:

1. Add the import for `useTotalSupply` after the existing `useMaxSupply` import (line 11):
   ```typescript
   import { useTotalSupply } from "@/hooks/read/useTotalSupply";
   ```

2. Inside the `MintButton` function, after the `useMaxSupply` call (line 27), add:
   ```typescript
   const { data: totalSupply } = useTotalSupply(chainId);
   ```

**Verify**: `cd app && npx tsc --noEmit` → exit 0 (no type errors from the new import/call)

### Step 2: Fix the soldOut logic

Replace the `soldOut` computation (lines 37-38):

```typescript
// OLD:
const soldOut =
  maxSupply !== undefined && maxSupply !== null && BigInt(maxSupply as bigint) === BigInt(0);
```

With:

```typescript
// NEW:
const soldOut =
  totalSupply !== undefined &&
  totalSupply !== null &&
  maxSupply !== undefined &&
  maxSupply !== null &&
  BigInt(totalSupply as bigint) >= BigInt(maxSupply as bigint);
```

This checks if the number of minted tokens has reached or exceeded the max supply.

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 3: Build and lint

**Verify**:
- `cd app && npm run build` → exit 0, routes `/`, `/gallery`, `/mint` generated
- `cd app && npm run lint` → exit 0

## Test plan

No new tests are required for this plan (frontend has no test infrastructure — see plan 005). Verification is via build + typecheck + lint.

Manual verification: when the contract's `getTotalSupply()` returns 21 (equal to MAX_SUPPLY), the MintButton should render "Sold Out" and be disabled. When totalSupply is less than 21, it should render "Mint NFT" normally.

## Done criteria

- [ ] `cd app && npx tsc --noEmit` exits 0
- [ ] `cd app && npm run build` exits 0
- [ ] `cd app && npm run lint` exits 0
- [ ] `grep -n "BigInt(0)" app/components/MintButton.tsx` returns no matches (the old broken check is gone)
- [ ] `grep -n "useTotalSupply" app/components/MintButton.tsx` returns at least 2 matches (import + hook call)
- [ ] No files outside `app/components/MintButton.tsx` are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at `app/components/MintButton.tsx` lines 36-38 doesn't match the excerpts in "Current state" (the codebase has drifted).
- `useTotalSupply` hook doesn't exist at `app/hooks/read/useTotalSupply.ts` or has a different export signature.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a per-wallet mint limit is added in the future, the `soldOut` check should also account for the wallet's remaining allowance, not just global supply.
- The `useMaxSupply` hook is still needed for the `soldOut` comparison — don't remove it.
