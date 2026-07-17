# Sepolia Deployment Record

**Network:** Sepolia (chain ID 11155111)  
**Date:** 2026-07-18  
**Deployer/owner:** `0x44941d655615d5F3A3E91190D8AeE7B6AD98aCFB`  
**Commit:** `11eb984`  
**Metadata base URI:** `ipfs://QmU6TRJMEoQb3EnGgbhismGJghAbrNPDz69SvXg4fgKG4L/`

> **Note:** an earlier deployment at `0x0Aa6CA8DE912fd938C9Ede3953753b2150Be778f` is deprecated; this newer contract includes `contractURI()` for OpenSea collection-level metadata.

## Contract

| Field | Value |
|-------|-------|
| Contract | `ArtisticAuras` |
| Address | `0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5` |
| Etherscan Sepolia | https://sepolia.etherscan.io/address/0xc800b15856b3711f433f51aae8bee6aa9c090ad5 |
| Name | Artistic Auras |
| Symbol | AURA |
| Max supply | 21 |
| Mint price | 0.04 ETH |
| Default royalty | 5% (500 bps) |
| Base URI | `ipfs://QmU6TRJMEoQb3EnGgbhismGJghAbrNPDz69SvXg4fgKG4L/` |
| Contract URI | `ipfs://QmU6TRJMEoQb3EnGgbhismGJghAbrNPDz69SvXg4fgKG4L/contract_metadata.json` |

## Transactions

| # | Action | Tx hash |
|---|--------|---------|
| 1 | Contract deploy & Etherscan verification | `0x76fe3229718db8c3047e43222a2888164ee7852650235e6c7d57ed3ddd12f1a4` |
| 2 | `setPublicSaleActive(true)` | `0xf9110573ddba47d72be3a03468a2b7aa5f2f708f7f0376984520a3f67ef85bd4` |
| 3 | Public mint of token #1 (0.04 ETH) | `0xe455bca55f9a46f8453b753080dd5e7a7e51622c8d562fe31cfbbd28ae75c853` |

## Live smoke-test results

- `contractURI()` = `ipfs://QmU6TRJMEoQb3EnGgbhismGJghAbrNPDz69SvXg4fgKG4L/contract_metadata.json`
- `ownerOf(1)` = `0x44941d655615d5F3A3E91190D8AeE7B6AD98aCFB`
- `tokenURI(1)` = `ipfs://QmU6TRJMEoQb3EnGgbhismGJghAbrNPDz69SvXg4fgKG4L/1.json`
- `getTotalSupply()` = `1`
- `publicSaleActive()` = `true`

## Notes

- Contract source was verified on Etherscan Sepolia successfully.
- `contractURI()` was added to expose OpenSea collection-level metadata (`name`, `description`, `image`, `external_link`, `seller_fee_basis_points`, `fee_recipient`).
- The contract is owned by the deployer address above. Before transferring ownership, fix the royalty-receiver desync issue (finding #1): either update the contract so `_transferOwnership` also calls `_setDefaultRoyalty(newOwner, 500)`, or manually call `setDefaultRoyalty(<newOwner>, 500)` immediately after `transferOwnership(<newOwner>)`.
