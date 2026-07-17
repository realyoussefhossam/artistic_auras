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

## Deployment

- Set environment variables from `.env.example`.
- Deploy via cast wallet (recommended): `forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify --account deployer -vvv`.
- After mainnet deployment, transfer ownership to the client wallet and verify `baseURI` points to the pinned metadata folder CID.

## Known quirks / guardrails

- The Python cleanup tests operate on a temporary copy of `special/special/` so they do not mutate committed artwork files.
- The contract's default royalty receiver is set to `owner()` in the constructor; if ownership is transferred, the receiver stays pointed at the original owner unless `setDefaultRoyalty` is called.
- `baseURI` and royalties are mutable by the owner by design.
- No timelock, multisig, or DAO mechanics are in scope for this collection.
- `.env` files are gitignored; never commit secrets.

## Decision docs

- `docs/superpowers/specs/2026-07-13-artistic-auras-nft-launch-design.md` — full launch design spec.
