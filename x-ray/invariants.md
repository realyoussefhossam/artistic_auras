# Invariant Map

> Artistic Auras | 6 guards | 1 inferred | 0 cross-contract | 0 economic

---

## 1. Enforced Guards (Reference)

Per-call preconditions in `ArtisticAuras.sol`.

#### G-1

`require(publicSaleActive, "Public sale is not active")` · `ArtisticAuras.sol:32` · Gates public minting behind the owner-controlled sale flag.

#### G-2

`require(quantity > 0, "Quantity must be greater than zero")` · `ArtisticAuras.sol:37` · Prevents zero-quantity calls that would otherwise loop zero times and waste gas.

#### G-3

`require(msg.value == MINT_PRICE * quantity, "Incorrect payment amount")` · `ArtisticAuras.sol:38` · Enforces exact ETH payment for the requested quantity; rejects overpayments and underpayments.

#### G-4

`require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached")` · `ArtisticAuras.sol:39` (also `ArtisticAuras.sol:49`) · Prevents any mint that would exceed the hard supply cap of 21 tokens.

#### G-5

`require(balance > 0, "No funds to withdraw")` · `ArtisticAuras.sol:84` · Prevents zero-balance withdraw calls from consuming gas and emitting no value movement.

#### G-6

`require(success, "Withdrawal failed")` · `ArtisticAuras.sol:87` · Ensures the ETH transfer to the owner succeeds before returning.

---

## 2. Inferred Invariants (Single-Contract)

#### I-1

`Category` · Bound · On-chain: **Yes**

> The total minted supply (`_tokenIds`) never exceeds `MAX_SUPPLY` (21).

**Derivation** — guard-lift: `require(_tokenIds + quantity <= MAX_SUPPLY, "Max supply reached")` at `ArtisticAuras.sol:39` and `ArtisticAuras.sol:49` is enforced at every write site of `_tokenIds` (`_tokenIds++` in `mint()` at `ArtisticAuras.sol:42` and in `mintToAddress()` at `ArtisticAuras.sol:52`). Because the counter is only incremented inside those loops and each loop runs at most `quantity` times with the cap checked upfront, `_tokenIds <= MAX_SUPPLY` holds globally.

**If violated** — More than 21 tokens could be minted, breaking the fixed-supply guarantee and the expected 1-to-21 metadata mapping.

---

## 3. Inferred Invariants (Cross-Contract)

None. All state assumptions are enforced inside the single in-scope contract or inherited from OpenZeppelin.

---

## 4. Economic Invariants

None derived from the single single-contract invariant.
