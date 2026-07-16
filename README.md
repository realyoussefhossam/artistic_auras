# Artistic Auras

A 21-piece abstract NFT collection on Ethereum.

## Project Layout

```
├── metadata-Files.csv          # source metadata
├── special/special/            # artwork images
├── metadata/                   # generated OpenSea-compatible JSONs
├── out/                        # generated token IDs + cleaned CSV
├── scripts/                    # Python cleanup and pinning scripts
├── src/                        # Solidity contracts
├── test/                       # Foundry tests
└── script/                     # Foundry deployment scripts
```

## Quick Start

### 1. Install Foundry dependencies

```bash
forge install
```

### 2. Install Python dependencies

```bash
python3 -m pip install -r scripts/requirements.txt
```

### 3. Run metadata cleanup

```bash
python3 scripts/cleanup_metadata.py
```

This generates `metadata/*.json` as sequential `1.json`–`21.json`, `out/token_ids.json`, `out/tokens.json`, and renames the artwork files to lowercase `.png`.

### 4. Build and test the contract

```bash
forge build
forge test -vvv
```

### 5. Deploy

Copy `.env.example` to `.env` and fill in your values, then:

```bash
# Sepolia testnet
source .env
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify --account deployer -vvv

# Mainnet
forge script script/Deploy.s.sol --rpc-url mainnet --broadcast --verify --account deployer -vvv
```

## Environment Variables

See `.env.example` for the required RPC endpoints, Etherscan API key, deployer address, and Pinata JWT. The deployer must have a `cast wallet` account (e.g. `--account deployer`).

## Useful Commands

```bash
forge build       # compile contracts
forge test        # run tests
forge fmt         # format Solidity
python3 -m pytest scripts/test_cleanup_metadata.py -v
```
