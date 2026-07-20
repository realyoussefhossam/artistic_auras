# Plan 003: Sync royalty receiver with ownership transfers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat d37d258..HEAD -- src/ArtisticAuras.sol test/ArtisticAuras.t.sol`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `d37d258`, 2026-07-19

## Why this matters

The constructor sets the ERC-2981 default royalty receiver to `owner()`. When ownership is transferred via `transferOwnership()`, the royalty receiver is NOT updated — it stays pointed at the original deployer. The design spec (`docs/superpowers/specs/2026-07-13-artistic-auras-nft-launch-design.md`, section 2 goal 5) explicitly calls for handing ownership to the client's wallet after mainnet deployment. If the client doesn't manually call `setDefaultRoyalty(newOwner, 500)` immediately after receiving ownership, all secondary-sale royalties silently accrue to the deployer. This was also flagged by the Pashov audit (`artistic_auras-pashov-ai-audit-report-20260716-230710.md`, finding 1, confidence 75).

## Current state

### Contract

`src/ArtisticAuras.sol` — the ERC-721 contract. The constructor sets the royalty receiver to `owner()`:

```solidity
// src/ArtisticAuras.sol:37-41
constructor(string memory baseURI) ERC721("Artistic Auras", "AURA") Ownable(msg.sender) {
    _baseTokenURI = baseURI;
    _contractURI = string(abi.encodePacked(baseURI, "contract_metadata.json"));
    _setDefaultRoyalty(owner(), ROYALTY_BASIS_POINTS);
}
```

The contract inherits `Ownable` from OpenZeppelin v5.x. In v5.x, `Ownable` has an internal virtual function `_transferOwnership(address newOwner)` that is called during both `transferOwnership()` and `renounceOwnership()`. The contract does not override it.

The contract already has a `setDefaultRoyalty` function (lines 95-98):
```solidity
function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
    _setDefaultRoyalty(receiver, feeNumerator);
    emit DefaultRoyaltyUpdated(receiver, feeNumerator);
}
```

And the `DefaultRoyaltyUpdated` event (line 32):
```solidity
event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
```

### OpenZeppelin v5 Ownable

In OpenZeppelin v5.x, `Ownable.transferOwnership()` calls `_transferOwnership()` which calls `_updateOwnership()`. The `_updateOwnership` function is internal and virtual, designed to be overridden. Its default implementation just sets `_owner = newOwner`.

### Existing test pattern

`test/ArtisticAuras.t.sol` has tests for royalty setting (lines 227-236):
```solidity
function test_SetDefaultRoyaltyByOwner() public {
    vm.prank(owner);
    artisticAuras.setDefaultRoyalty(user2, 1_000);

    uint256 salePrice = 1 ether;
    (address receiver, uint256 royaltyAmount) = artisticAuras.royaltyInfo(1, salePrice);

    assertEq(receiver, user2);
    assertEq(royaltyAmount, 0.1 ether);
}
```

### Repo conventions

- Solidity `^0.8.27` in `foundry.toml`.
- `forge fmt` for formatting.
- NatSpec comments on all functions.
- Events emitted for all state changes.
- Tests use `vm.prank`, `vm.expectEmit`, `vm.expectRevert` patterns.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Build     | `forge build`                    | exit 0              |
| Tests     | `forge test -vvv`                | all pass            |
| Format    | `forge fmt --check`              | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/ArtisticAuras.sol` — override `_updateOwnership` to sync royalty receiver
- `test/ArtisticAuras.t.sol` — add test for royalty sync on ownership transfer

**Out of scope** (do NOT touch):
- `script/Deploy.s.sol` — no deployment script changes
- Any frontend files
- `metadata/` or `scripts/`

## Git workflow

- Branch: `advisor/003-royalty-sync`
- Commit message style: conventional commits, e.g. `fix: sync royalty receiver on ownership transfer`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Override _transferOwnership to sync royalty receiver

In `src/ArtisticAuras.sol`, add an override of `_transferOwnership` that updates the default royalty receiver whenever ownership changes. Add this function after the `setDefaultRoyalty` function (after line 98, before `setTokenRoyalty`):

```solidity
/// @dev Hook called by OpenZeppelin's Ownable when ownership changes.
/// Automatically syncs the default royalty receiver to the new owner.
function _transferOwnership(address newOwner) internal override {
    super._transferOwnership(newOwner);
    if (newOwner != address(0)) {
        _setDefaultRoyalty(newOwner, ROYALTY_BASIS_POINTS);
        emit DefaultRoyaltyUpdated(newOwner, ROYALTY_BASIS_POINTS);
    }
}
```

Why `newOwner != address(0)` check: during `renounceOwnership()`, the new owner is `address(0)`. We should not set a royalty receiver to the zero address (OpenZeppelin's `_setDefaultRoyalty` reverts on zero-address receiver anyway). When ownership is renounced, the existing royalty receiver stays as-is — the owner should call `setDefaultRoyalty` before renouncing if they want to change it.

**Verify**: `forge build` → exit 0, no compilation errors

### Step 2: Add test for royalty sync on transferOwnership

In `test/ArtisticAuras.t.sol`, add this test function (place it after `test_SetDefaultRoyaltyByOwner`, around line 236):

```solidity
function test_RoyaltyReceiverSyncsOnOwnershipTransfer() public {
    // Before transfer: royalty receiver is the original owner
    uint256 salePrice = 1 ether;
    (address receiverBefore,) = artisticAuras.royaltyInfo(1, salePrice);
    assertEq(receiverBefore, owner);

    // Transfer ownership to user2
    vm.prank(owner);
    artisticAuras.transferOwnership(user2);

    // After transfer: royalty receiver should be user2
    (address receiverAfter, uint256 royaltyAmount) = artisticAuras.royaltyInfo(1, salePrice);
    assertEq(receiverAfter, user2);
    assertEq(royaltyAmount, salePrice * artisticAuras.ROYALTY_BASIS_POINTS() / 10_000);

    // New owner is user2
    assertEq(artisticAuras.owner(), user2);
}
```

Also add a test that verifies the event is emitted:

```solidity
function test_RoyaltySyncEmitsEventOnOwnershipTransfer() public {
    vm.expectEmit(true, false, false, true);
    emit DefaultRoyaltyUpdated(user2, artisticAuras.ROYALTY_BASIS_POINTS());

    vm.prank(owner);
    artisticAuras.transferOwnership(user2);
}
```

And a test that renounceOwnership does NOT revert (the zero-address guard):

```solidity
function test_RenounceOwnershipDoesNotRevert() public {
    vm.prank(owner);
    artisticAuras.renounceOwnership();

    assertEq(artisticAuras.owner(), address(0));
}
```

**Verify**: `forge test -vvv` → all tests pass, including the 3 new tests

### Step 3: Format check

**Verify**: `forge fmt --check` → exit 0

If formatting fails, run `forge fmt` to auto-format, then re-check.

## Test plan

Three new tests added to `test/ArtisticAuras.t.sol`:

1. `test_RoyaltyReceiverSyncsOnOwnershipTransfer` — verifies that after `transferOwnership`, the royalty receiver is the new owner and the royalty amount is correct.
2. `test_RoyaltySyncEmitsEventOnOwnershipTransfer` — verifies the `DefaultRoyaltyUpdated` event is emitted during ownership transfer.
3. `test_RenounceOwnershipDoesNotRevert` — verifies that `renounceOwnership` (which sets owner to address(0)) does not revert due to the royalty sync guard.

Pattern: follows existing test style in `ArtisticAuras.t.sol` — uses `vm.prank`, `assertEq`, `royaltyInfo()` to check receiver.

## Done criteria

- [ ] `forge build` exits 0
- [ ] `forge test -vvv` exits 0, all tests pass including 3 new tests
- [ ] `forge fmt --check` exits 0
- [ ] `grep -n "_transferOwnership" src/ArtisticAuras.sol` returns matches (override exists)
- [ ] `grep -n "test_RoyaltyReceiverSyncsOnOwnershipTransfer" test/ArtisticAuras.t.sol` returns a match
- [ ] No files outside `src/ArtisticAuras.sol` and `test/ArtisticAuras.t.sol` are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at `src/ArtisticAuras.sol` lines 37-41 or 95-98 doesn't match the excerpts in "Current state" (the codebase has drifted).
- OpenZeppelin v5.x's `Ownable` does not have a `_transferOwnership` internal virtual function (check `lib/openzeppelin-contracts/contracts/access/Ownable.sol` — if the function signature or name is different, STOP and report the actual signature).
- `forge build` fails with an error related to the `_transferOwnership` override (e.g. function doesn't exist, wrong signature, or override keyword not accepted).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If `ROYALTY_BASIS_POINTS` is ever made mutable (currently a constant), the `_updateOwnership` override should use the current value, not the constant — update accordingly.
- If per-token royalty overrides are set before ownership transfer, they are NOT affected by this change — only the default royalty is synced. This is intentional; per-token overrides are explicit and should persist.
- A reviewer should verify that the `_updateOwnership` override correctly calls `super._updateOwnership(newOwner)` BEFORE setting the royalty, so the new owner is set before the royalty receiver is updated.
