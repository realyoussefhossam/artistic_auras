# Plan 004: Add agent onboarding docs (AGENTS.md)

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- AGENTS.md`
> If `AGENTS.md` already changed since this plan was written, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

This repo is worked on by AI agents, but there is no single place that documents project structure, build/test commands, conventions, and known quirks (such as the Python tests needing isolation). An `AGENTS.md` reduces onboarding friction and prevents future agents from re-learning the same context. It is a low-cost, high-leverage addition for any agentic execution.

## Current state

- `README.md` covers basic setup but not agent-specific conventions.
- `docs/superpowers/specs/2026-07-13-artistic-auras-nft-launch-design.md` contains the design spec.
- No `AGENTS.md` or `CLAUDE.md` exists at the repo root.

Repo conventions observed:
- Foundry project; Solidity in `src/`, tests in `test/`, deployment scripts in `script/`.
- Python metadata scripts in `scripts/`.
- Conventional commits (examples from `git log`): `feat: ...`, `refactor: ...`, `docs: ...`, `security: ...`, `ci: ...`, `test: ...`.
- Formatting: `forge fmt --check` for Solidity.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Check formatting | `forge fmt --check` | exit 0 |
| Build contract | `forge build` | exit 0 |
| Run Foundry tests | `forge test -vvv` | 27 tests pass |
| Run Python tests | `python3 -m pytest scripts/test_cleanup_metadata.py -v` | 3 tests pass |

## Scope

**In scope**:
- Create `AGENTS.md` at repo root.

**Out of scope**:
- Source code changes.
- README edits unless the README is actively wrong.

## Git workflow

- Branch: `advisor/004-add-agent-onboarding-docs`
- Commit message style: `docs: add AGENTS.md onboarding guide`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `AGENTS.md`

Create `AGENTS.md` with the following sections. Keep it factual and specific to this repo; avoid generic advice.

```markdown
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

- The Python cleanup tests must NOT mutate `special/special/`; if they still reference that directory as `image_dir`, fix the isolation first.
- The contract's default royalty receiver is set to `owner()` in the constructor; if ownership is transferred, the receiver should follow the new owner (see plan 001/royalty sync).
- `baseURI` and royalties are mutable by the owner by design.
- No timelock, multisig, or DAO mechanics are in scope for this collection.
- `.env` files are gitignored; never commit secrets.

## Decision docs

- `docs/superpowers/specs/2026-07-13-artistic-auras-nft-launch-design.md` — full launch design spec.
```

You may adjust phrasing, but the sections and facts must match the repo.

**Verify**: `test -f AGENTS.md && head -n 5 AGENTS.md` → file exists and begins with the heading.

### Step 2: Run the standard verification commands

**Verify**: `forge fmt --check` → exit 0.
**Verify**: `forge build` → exit 0.
**Verify**: `forge test -vvv` → 27 tests pass.
**Verify**: `python3 -m pytest scripts/test_cleanup_metadata.py -v` → 3 tests pass.

## Test plan

No automated tests for documentation. Manual checks:
- The file is formatted as valid Markdown.
- All commands listed run successfully in the local environment.

## Done criteria

- [ ] `AGENTS.md` exists at repo root with the required sections.
- [ ] `forge fmt --check`, `forge build`, and `forge test -vvv` pass.
- [ ] `python3 -m pytest scripts/test_cleanup_metadata.py -v` passes.
- [ ] No other source files are modified.
- [ ] `plans/README.md` status row for plan 004 is updated to DONE.

## STOP conditions

Stop and report if:
- The repository structure in the drift check differs from what this plan assumes (e.g., tests moved to a different directory).
- Any verification command fails due to environment issues unrelated to this plan.

## Maintenance notes

- Keep `AGENTS.md` in sync with any future directory reorganization or command changes.
- If a `CLAUDE.md` convention is preferred, maintain `AGENTS.md` as the single source of truth and link from `CLAUDE.md`.
