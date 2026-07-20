# Plan 004: Wire up real token ID in MintSuccessModal

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat d37d258..HEAD -- app/hooks/write/useMint.ts app/components/MintButton.tsx app/components/MintSuccessModal.tsx`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `d37d258`, 2026-07-19

## Why this matters

When a user successfully mints an NFT, the success modal is supposed to show the token ID (e.g. "#3"). But `useMint` passes `undefined` as the token ID to the `onSuccess` callback — it never reads the `NFTMinted` event from the transaction receipt. The "Token ID" section in `MintSuccessModal` is dead code that never renders. Users see "Aura Minted!" but don't know which token they got.

## Current state

### useMint hook

`app/hooks/write/useMint.ts` (full file, 25 lines):
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useMint(chainId: number) {
  const { writeContractAsync, data: hash, isPending, error } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const mint = async (quantity: bigint) => {
    const address = getContractAddress(chainId);
    const price = parseEther("0.04");
    return writeContractAsync({
      abi: contractABI,
      address,
      functionName: "mint",
      args: [quantity],
      value: price * quantity,
    });
  };

  return { mint, hash, isPending, isConfirming, isConfirmed, error };
}
```

The hook uses `useWaitForTransactionReceipt` which returns a `receipt` object containing logs. The contract emits `NFTMinted(address indexed to, uint256 indexed tokenId)` for each token minted. The receipt's logs can be parsed to extract the token ID(s).

### MintButton component

`app/components/MintButton.tsx` calls `onSuccess` with `undefined` as the token ID:

```typescript
// app/components/MintButton.tsx:44-53
useEffect(() => {
  if (isConfirmed && !confirmedRef.current) {
    confirmedRef.current = true;
    toast.success("Minted successfully!");
    onSuccess?.(undefined, hash);
  }
  if (!isConfirmed) {
    confirmedRef.current = false;
  }
}, [isConfirmed, onSuccess, hash]);
```

The `onSuccess` callback signature is `(tokenId?: bigint, txHash?: string) => void` (line 17).

### MintSuccessModal

`app/components/MintSuccessModal.tsx` renders the token ID only if it's not undefined:

```typescript
// app/components/MintSuccessModal.tsx:39-48
{tokenId !== undefined && (
  <div className="flex items-center justify-between rounded-lg bg-surface-container-high/60 px-4 py-3">
    <span className="font-mono text-xs uppercase tracking-widest text-outline">
      Token ID
    </span>
    <span className="font-heading text-lg text-on-surface">
      #{tokenId.toString()}
    </span>
  </div>
)}
```

### Contract event

The contract emits `NFTMinted(address indexed to, uint256 indexed tokenId)` for each minted token (src/ArtisticAuras.sol:29, 60). For a batch mint of quantity N, there are N logs.

### wagmi receipt parsing

`useWaitForTransactionReceipt` returns `{ data: receipt }` where `receipt` has a `logs` array. Each log has `topics` (array of `0x${string}`) and `data`. For the `NFTMinted` event:
- `topics[0]` = keccak256 of "NFTMinted(address,uint256)"
- `topics[1]` = indexed `to` address (padded to 32 bytes)
- `topics[2]` = indexed `tokenId` (padded to 32 bytes, as a bigint)

The event signature hash for `NFTMinted(address,uint256)` is `0x83b7e89d6d3f47e3a4a2c7c9c4f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0` — but don't hardcode it. Use viem's `decodeEventLog` or `parseEventLogs` utility instead.

### Repo conventions

- Hooks are in `app/hooks/`, each exporting a single function.
- TypeScript strict mode.
- `viem` is available for ABI parsing utilities.
- `contractABI` is imported from `@/lib/contract`.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `cd app && npm install`          | exit 0              |
| Typecheck | `cd app && npx tsc --noEmit`     | exit 0, no errors   |
| Build     | `cd app && npm run build`        | exit 0, all routes generated |
| Lint      | `cd app && npm run lint`         | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `app/hooks/write/useMint.ts` — parse token ID from receipt logs
- `app/components/MintButton.tsx` — pass parsed token ID to onSuccess

**Out of scope** (do NOT touch):
- `app/components/MintSuccessModal.tsx` — already correctly renders tokenId when provided
- `app/app/mint/page.tsx` — already correctly passes tokenId to the modal
- `app/lib/contract.ts` — no changes needed

## Git workflow

- Branch: `advisor/004-real-token-id`
- Commit message style: conventional commits, e.g. `fix: parse and display real token ID in mint success modal`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Parse token ID from receipt in useMint hook

In `app/hooks/write/useMint.ts`:

1. Add imports for viem's log parsing utilities:
   ```typescript
   import { parseEther, decodeEventLog, type Log } from "viem";
   ```

2. Destructure `data: receipt` from `useWaitForTransactionReceipt`:
   ```typescript
   // OLD (line 9-10):
   const { isLoading: isConfirming, isSuccess: isConfirmed } =
     useWaitForTransactionReceipt({ hash });
   ```
   Replace with:
   ```typescript
   // NEW:
   const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
     useWaitForTransactionReceipt({ hash });
   ```

3. Add a function to extract the last minted token ID from the receipt logs. Place it after the `mint` function definition, before the `return` statement:
   ```typescript
   /** Parses the NFTMinted events from the receipt and returns the last token ID. */
   function getLastMintedTokenId(receipt: { logs: readonly Log[] } | undefined): bigint | undefined {
     if (!receipt) return undefined;
     for (let i = receipt.logs.length - 1; i >= 0; i--) {
       try {
         const decoded = decodeEventLog({
           abi: contractABI,
           data: receipt.logs[i].data,
           topics: receipt.logs[i].topics as any,
         });
         if (decoded.eventName === "NFTMinted" && decoded.args.tokenId !== undefined) {
           return decoded.args.tokenId as bigint;
         }
       } catch {
         // Not an NFTMinted log — skip
       }
     }
     return undefined;
   }
   ```

4. Add `mintedTokenId` to the return value:
   ```typescript
   // OLD (line 24):
   return { mint, hash, isPending, isConfirming, isConfirmed, error };
   ```
   Replace with:
   ```typescript
   // NEW:
   const mintedTokenId = getLastMintedTokenId(receipt);
   return { mint, hash, isPending, isConfirming, isConfirmed, error, mintedTokenId };
   ```

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 2: Pass mintedTokenId to onSuccess in MintButton

In `app/components/MintButton.tsx`:

1. Destructure `mintedTokenId` from the `useMint` return. Find line 23:
   ```typescript
   // OLD:
   const { mint, hash, isPending, isConfirming, isConfirmed, error } =
     useMint(chainId);
   ```
   Replace with:
   ```typescript
   // NEW:
   const { mint, hash, isPending, isConfirming, isConfirmed, error, mintedTokenId } =
     useMint(chainId);
   ```

2. Update the `onSuccess` call to pass the real token ID. Find lines 44-53:
   ```typescript
   // OLD:
   useEffect(() => {
     if (isConfirmed && !confirmedRef.current) {
       confirmedRef.current = true;
       toast.success("Minted successfully!");
       onSuccess?.(undefined, hash);
     }
     if (!isConfirmed) {
       confirmedRef.current = false;
     }
   }, [isConfirmed, onSuccess, hash]);
   ```
   Replace with:
   ```typescript
   // NEW:
   useEffect(() => {
     if (isConfirmed && !confirmedRef.current) {
       confirmedRef.current = true;
       toast.success("Minted successfully!");
       onSuccess?.(mintedTokenId, hash);
     }
     if (!isConfirmed) {
       confirmedRef.current = false;
     }
   }, [isConfirmed, onSuccess, hash, mintedTokenId]);
   ```

**Verify**: `cd app && npx tsc --noEmit` → exit 0

### Step 3: Build and lint

**Verify**:
- `cd app && npm run build` → exit 0, routes `/`, `/gallery`, `/mint` generated
- `cd app && npm run lint` → exit 0

## Test plan

No new automated tests (frontend has no test infrastructure yet — see plan 005). Verification is via build + typecheck + lint.

Manual verification: after a successful mint on Sepolia, the success modal should display "Token ID #N" where N is the actual minted token ID from the transaction receipt. For a batch mint of 2, it should show the last token ID minted.

## Done criteria

- [ ] `cd app && npx tsc --noEmit` exits 0
- [ ] `cd app && npm run build` exits 0
- [ ] `cd app && npm run lint` exits 0
- [ ] `grep -n "mintedTokenId" app/hooks/write/useMint.ts` returns matches (new return value)
- [ ] `grep -n "mintedTokenId" app/components/MintButton.tsx` returns matches (destructured + passed to onSuccess)
- [ ] `grep -n "onSuccess?.(undefined" app/components/MintButton.tsx` returns no matches (old undefined call removed)
- [ ] No files outside `app/hooks/write/useMint.ts` and `app/components/MintButton.tsx` are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at `app/hooks/write/useMint.ts` or `app/components/MintButton.tsx` doesn't match the excerpts in "Current state" (the codebase has drifted).
- `decodeEventLog` is not available in the installed version of viem (check `node_modules/viem` — if it doesn't export `decodeEventLog`, STOP and report the available alternatives).
- The `NFTMinted` event is not in `contractABI` (check `app/lib/abi.json` for an event named "NFTMinted" — if it's missing or named differently, STOP).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- For batch mints (quantity > 1), this shows only the LAST token ID. If the UI should show all minted token IDs, the `getLastMintedTokenId` function should be changed to return an array, and `MintSuccessModal` updated to render multiple IDs. This is deferred — the current behavior (showing the last ID) is still a major improvement over showing nothing.
- If the contract event signature changes (e.g. `NFTMinted` is renamed or its args change), the `decodeEventLog` call will silently skip the log and return `undefined`. The `try/catch` handles this gracefully.
