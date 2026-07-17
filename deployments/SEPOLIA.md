# Sepolia Deployment Record

**Network:** Sepolia (chain ID 11155111)  
**Date:** 2026-07-17  
**Deployer/owner:** `0x44941d655615d5F3A3E91190D8AeE7B6AD98aCFB`

## Contract

| Field | Value |
|-------|-------|
| Contract | `ArtisticAuras` |
| Address | `0x0Aa6CA8DE912fd938C9Ede3953753b2150Be778f` |
| Etherscan Sepolia | https://sepolia.etherscan.io/address/0x0aa6ca8de912fd938c9ede3953753b2150be778f |
| Name | Artistic Auras |
| Symbol | AURA |
| Max supply | 21 |
| Mint price | 0.04 ETH |
| Default royalty | 5% (500 bps) |
| Base URI | `ipfs://Qma2a6Hf96d3BUcJ94qewBbwakjwZcWVfjFPHdoWRYUWz9/` |

## Transactions

| # | Action | Tx hash |
|---|--------|---------|
| 1 | Contract deploy & Etherscan verification | `0x2f8a624ca757a6ebe487aa4636195f01c95e3a8f48e8efa49faa2e73bd09e8c0` |
| 2 | `setPublicSaleActive(true)` | `0x02f47706c19c1bb05a74e42bf42049be2e847b7751f323d4d59439ccc47787b5` |
| 3 | Public mint of token #1 (0.04 ETH) | `0x7fd282c5fe2b41876dc1043b5bd370ed1550ea7dc3abac4be6d28acdbdacf1ee` |

## Live smoke-test results

- `ownerOf(1)` = `0x44941d655615d5F3A3E91190D8AeE7B6AD98aCFB`
- `tokenURI(1)` = `ipfs://Qma2a6Hf96d3BUcJ94qewBbwakjwZcWVfjFPHdoWRYUWz9/1.json`
- `getTotalSupply()` = `1`
- `publicSaleActive()` = `true`

## Notes

- Contract source was verified on Etherscan Sepolia successfully.
- The contract is owned by the deployer address above. Before transferring ownership, fix the royalty-receiver desync issue (finding #1): either update the contract so `_transferOwnership` also calls `_setDefaultRoyalty(newOwner, 500)`, or manually call `setDefaultRoyalty(<newOwner>, 500)` immediately after `transferOwnership(<newOwner>)`.
