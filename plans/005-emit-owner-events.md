# Plan 005: Emit events for privileged owner state changes

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- src/ArtisticAuras.sol test/ArtisticAuras.t.sol`
> If either file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security / observability
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

Owner-controlled state changes (`setBaseURI`, `setPublicSaleActive`, royalty updates, `withdraw`) currently emit no events. Off-chain indexers, monitoring tools, and frontends cannot react to these changes without polling state directly. Adding events improves transparency and makes it easier to detect unexpected owner actions (e.g., a sudden `baseURI` change after a compromise).

## Current state

- `src/ArtisticAuras.sol` — the only contract; `mint` already emits `NFTMinted`.
- `test/ArtisticAuras.t.sol` — tests for owner functions exist but do not assert event emission.

Relevant excerpts:

`src/ArtisticAuras.sol:24`:
```solidity
    event NFTMinted(address indexed to, uint256 indexed tokenId);
```

`src/ArtisticAuras.sol:58-87`:
```solidity
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setPublicSaleActive(bool active) external onlyOwner {
        publicSaleActive = active;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
```

OpenZeppelin `ERC721Pausable` already emits `Paused`/`Unpaused` from `_pause`/`_unpause`, so `pause` and `unpause` do not need additional events.

Repo conventions: events use `PascalCase`, indexed arguments for addresses and token IDs. Follow the existing `NFTMinted` style.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Format check | `forge fmt --check` | exit 0 |
| Build | `forge build` | exit 0 |
| Test | `forge test -vvv` | 27 tests pass plus new ones |

## Scope

**In scope**:
- `src/ArtisticAuras.sol`
- `test/ArtisticAuras.t.sol`

**Out of scope**:
- `mint` event logic (already emits).
- `pause`/`unpause` behavior (OZ events suffice).
- Any change to access control or pricing logic.

## Git workflow

- Branch: `advisor/005-emit-owner-events`
- Commit message style: `feat: emit events for owner state changes`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add event definitions

Add the following events near the existing `NFTMinted` event in `src/ArtisticAuras.sol`:

```solidity
    event BaseURIUpdated(string baseURI);
    event PublicSaleToggled(bool active);
    event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    event TokenRoyaltyUpdated(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);
    event Withdrawal(address indexed to, uint256 amount);
```

**Verify**: `grep -n "event BaseURIUpdated\|event PublicSaleToggled\|event DefaultRoyaltyUpdated\|event TokenRoyaltyUpdated\|event Withdrawal" src/ArtisticAuras.sol` → shows all five event definitions.

### Step 2: Emit the events in owner functions

Update each function to emit the corresponding event after the state change:

```solidity
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    function setPublicSaleActive(bool active) external onlyOwner {
        publicSaleActive = active;
        emit PublicSaleToggled(active);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit DefaultRoyaltyUpdated(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit TokenRoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(owner(), balance);
    }
```

**Verify**: `grep -n "emit BaseURIUpdated\|emit PublicSaleToggled\|emit DefaultRoyaltyUpdated\|emit TokenRoyaltyUpdated\|emit Withdrawal" src/ArtisticAuras.sol` → shows one emit per event.

### Step 3: Add tests that assert each event emits

Append tests to `test/ArtisticAuras.t.sol` following the existing owner-function test patterns. Example:

```solidity
    function test_SetBaseURIEmitsEvent() public {
        string memory newBaseURI = "ipfs://QmNew/";

        vm.expectEmit(false, false, false, true);
        emit BaseURIUpdated(newBaseURI);

        vm.prank(owner);
        artisticAuras.setBaseURI(newBaseURI);
    }

    function test_SetPublicSaleActiveEmitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit PublicSaleToggled(true);

        vm.prank(owner);
        artisticAuras.setPublicSaleActive(true);
    }

    function test_SetDefaultRoyaltyEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit DefaultRoyaltyUpdated(user2, 1_000);

        vm.prank(owner);
        artisticAuras.setDefaultRoyalty(user2, 1_000);
    }

    function test_SetTokenRoyaltyEmitsEvent() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.expectEmit(true, true, false, true);
        emit TokenRoyaltyUpdated(1, user2, 1_000);

        vm.prank(owner);
        artisticAuras.setTokenRoyalty(1, user2, 1_000);
    }

    function test_WithdrawEmitsEvent() public {
        _enableSale();
        vm.deal(user1, MINT_PRICE);
        vm.prank(user1);
        artisticAuras.mint{value: MINT_PRICE}(1);

        vm.expectEmit(true, false, false, true);
        emit Withdrawal(owner(), MINT_PRICE);

        vm.prank(owner);
        artisticAuras.withdraw();
    }
```

Make sure the test contract knows about the new events. Because the events are declared in `ArtisticAuras`, and `ArtisticAurasTest` imports `ArtisticAuras`, you can `emit` them in tests by name if the event signatures match.

**Verify**: `forge test -vvv` → all 32 tests pass (27 existing + 5 new).

## Test plan

- 5 new tests, one per owner action that now emits an event.
- Each test uses `vm.expectEmit` with the correct indexed parameter flags.
- No changes to existing test logic except adding the new event tests.

## Done criteria

- [ ] `src/ArtisticAuras.sol` defines and emits `BaseURIUpdated`, `PublicSaleToggled`, `DefaultRoyaltyUpdated`, `TokenRoyaltyUpdated`, and `Withdrawal`.
- [ ] `test/ArtisticAuras.t.sol` contains passing tests asserting each event emission.
- [ ] `forge fmt --check` passes.
- [ ] `forge build` passes.
- [ ] `forge test -vvv` passes with 32 tests.
- [ ] No access-control, pricing, or pause logic changed.
- [ ] `plans/README.md` status row for plan 005 is updated to DONE.

## STOP conditions

Stop and report if:
- The contract or test file excerpts above do not match the live code (drift).
- `forge test` fails after the event additions and a reasonable fix attempt.
- Adding events changes any function's gas behavior in a way that breaks existing assertions (none should).

## Maintenance notes

- If more owner-controlled state variables are added in the future, add corresponding events by the same pattern.
- Reviewers should confirm `expectEmit` flags match event `indexed` parameters.
