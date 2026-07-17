# AGENTS.md — Artistic Auras

## Project overview

A 21-piece abstract NFT collection on Ethereum. The repo contains:

- `src/ArtisticAuras.sol` — ERC-721 minting contract (OpenZeppelin v5.x).
- `test/ArtisticAuras.t.sol` — Foundry unit tests.
- `script/Deploy.s.sol` — Foundry deployment script.
- `scripts/cleanup_metadata.py` — normalizes CSV/image assets into `metadata/*.json`.
- `scripts/pin_metadata.py` — pins the `metadata/` folder to Pinata/IPFS.
- `scripts/test_cleanup_metadata.py` — pytest suite for the cleanup script.
- `metadata/` — generated OpenSea-compatible JSONs.
- `special/special/` — artwork PNGs.

## Build, test, lint

```bash
# Solidity
forge build
forge test -vvv
forge fmt --check

# Python metadata pipeline
python3 -m pip install -r scripts/requirements.txt
python3 -m pytest scripts/test_cleanup_metadata.py -v
```

## Conventions

- Solidity `^0.8.27` in `foundry.toml`.
- All source code lives in `src/`, `test/`, `script/`.
- Error strings for custom `require` messages; OpenZeppelin custom errors bubble through as-is.
- Constants are `UPPER_SNAKE_CASE` and public where useful (`MAX_SUPPLY`, `MINT_PRICE`, `ROYALTY_BASIS_POINTS`).
- Prefer `forge fmt` for Solidity formatting.
- Python scripts use `pathlib` and target Python 3.10+.

## Deployment readiness

As of the latest changes:

- `forge build`, `forge test -vvv`, and `forge fmt --check` pass.
- The contract is safe to deploy to **Sepolia under the deployer wallet** for live minting/metadata tests.
- **Known open issue before ownership transfer:** the default royalty receiver is set to `owner()` in the constructor. If `transferOwnership(newOwner)` is called, royalties continue to accrue to the original deployer until `setDefaultRoyalty(newOwner, 500)` is also called. Fix this before transferring ownership on any network.

## Deployment

1. Set environment variables from `.env` (do not commit it):
   - `SEPOLIA_RPC`
   - `ETHERSCAN_API_KEY`
   - `METADATA_BASE_URI` (must end with `/` and point to the pinned `metadata/` folder)
2. Ensure the deployer `cast wallet` account exists and is funded with Sepolia ETH:
   - `cast wallet list`
   - `cast wallet address --account deployer`
   - `cast balance <deployer_address> --rpc-url $SEPOLIA_RPC`
3. Deploy to Sepolia:
   ```bash
   source .env
   forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify --account deployer -vvv
   ```
4. After deploy, verify:
   - `publicSaleActive()` is `false` by default.
   - `baseURI()` matches the pinned metadata folder CID.
   - OpenSea Sepolia renders the collection metadata.
5. To open the public sale, call `setPublicSaleActive(true)` from the owner wallet.
6. **Before transferring ownership:** either fix the royalty-receiver sync bug in the contract or manually call `setDefaultRoyalty(<newOwner>, 500)` immediately after `transferOwnership(<newOwner>)`.

## Known quirks / guardrails

- The Python cleanup tests operate on a temporary copy of `special/special/` so they do not mutate committed artwork files.
- The contract's default royalty receiver is set to `owner()` in the constructor; if ownership is transferred, the receiver stays pointed at the original owner unless `setDefaultRoyalty` is called.
- `baseURI` and royalties are mutable by the owner by design.
- No timelock, multisig, or DAO mechanics are in scope for this collection.
- `.env` files are gitignored; never commit secrets.

## Decision docs

- `docs/superpowers/specs/2026-07-13-artistic-auras-nft-launch-design.md` — full launch design spec.
