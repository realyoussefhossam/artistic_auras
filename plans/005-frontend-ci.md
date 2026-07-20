# Plan 005: Add frontend CI (build, lint, typecheck)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat d37d258..HEAD -- .github/workflows/test.yml app/package.json`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `d37d258`, 2026-07-19

## Why this matters

The CI pipeline (`.github/workflows/test.yml`) only runs Foundry build/tests and Python metadata tests. The entire Next.js frontend in `app/` has no CI coverage — no build, no lint, no typecheck. A broken frontend change can be merged without any signal. This is especially dangerous because the frontend uses Next.js 16 with React 19, which has breaking changes from older versions, and type errors are easy to introduce when editing wagmi/viem hooks.

## Current state

### Existing CI

`.github/workflows/test.yml` (full file, 46 lines):
```yaml
name: CI

permissions: {}

on:
  push:
  pull_request:
  workflow_dispatch:

jobs:
  check:
    name: Foundry project
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
          submodules: recursive

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Show Forge version
        run: forge --version

      - name: Run Forge fmt
        run: forge fmt --check

      - name: Run Forge build
        run: forge build --sizes

      - name: Run Forge tests
        run: forge test -vvv

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Python dependencies
        run: python3 -m pip install -r scripts/requirements.txt

      - name: Run Python metadata tests
        run: python3 -m pytest scripts/test_cleanup_metadata.py -v
```

All steps are in a single job called `check`. There is no Node.js setup, no `npm install`, and no frontend verification.

### Frontend package.json

`app/package.json` has these scripts (lines 6-11):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "node -e \"const fs=require('fs'); const d=JSON.parse(fs.readFileSync('../out/ArtisticAuras.sol/ArtisticAuras.json')); fs.writeFileSync('lib/abi.json', JSON.stringify(d.abi, null, 2));\""
}
```

Note: `postinstall` reads from `../out/ArtisticAuras.sol/ArtisticAuras.json` — this means `npm install` in `app/` requires the Solidity build artifacts to exist in `../out/`. The CI must run `forge build` BEFORE `npm install` in the frontend job. This is why the frontend job should depend on the Foundry job, or be in the same job after the Foundry build.

There is no separate `typecheck` script — typecheck is done via `npx tsc --noEmit`.

### Frontend location

The Next.js app is in the `app/` subdirectory (not the repo root). All npm commands must be run from `app/`.

### Repo conventions

- CI uses `actions/checkout@v7` with `persist-credentials: false`
- CI uses `permissions: { contents: read }` at the job level
- Single workflow file for all checks

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Build (Solidity) | `forge build`             | exit 0, creates `out/` |
| Install (frontend) | `cd app && npm install` | exit 0, runs postinstall to generate `lib/abi.json` |
| Typecheck | `cd app && npx tsc --noEmit`     | exit 0, no errors   |
| Build (frontend) | `cd app && npm run build` | exit 0, all routes generated |
| Lint      | `cd app && npm run lint`         | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `.github/workflows/test.yml` — add frontend verification steps

**Out of scope** (do NOT touch):
- `app/package.json` — no script changes needed
- `app/tsconfig.json` — no config changes
- Any frontend source files

## Git workflow

- Branch: `advisor/005-frontend-ci`
- Commit message style: conventional commits, e.g. `ci: add frontend build, lint, and typecheck to CI`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add frontend verification steps to CI

In `.github/workflows/test.yml`, add the following steps AFTER the "Run Python metadata tests" step (after line 46, at the end of the `check` job):

```yaml
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: app/package-lock.json

      - name: Install frontend dependencies
        working-directory: app
        run: npm install

      - name: Typecheck frontend
        working-directory: app
        run: npx tsc --noEmit

      - name: Lint frontend
        working-directory: app
        run: npm run lint

      - name: Build frontend
        working-directory: app
        run: npm run build
        env:
          NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID }}
```

Key design decisions:
- `actions/setup-node@v4` with Node 20 (LTS).
- `cache: "npm"` with `cache-dependency-path: app/package-lock.json` for faster CI runs.
- `working-directory: app` for all frontend steps since the app is in a subdirectory.
- `npm install` runs the `postinstall` script which reads `../out/ArtisticAuras.sol/ArtisticAuras.json` — this works because `forge build` already ran earlier in the same job and created `out/`.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is passed via GitHub secrets. The build will fail without it (wagmi.ts throws an error if it's missing). If the secret is not set, the build step will fail — which is the correct behavior (the frontend can't work without it).
- Steps are ordered: install → typecheck → lint → build. Typecheck is fastest and catches the most errors, so it runs first.

**Verify**: The YAML is valid — run `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))"` → exit 0, no errors

### Step 2: Verify locally that the commands work

Run the exact commands the CI will run, in order, to confirm they all pass on the current codebase:

```bash
forge build && cd app && npm install && npx tsc --noEmit && npm run lint && npm run build
```

**Verify**: all commands exit 0 in sequence.

Note: if `npm run build` fails because `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is not set in your local `.env`, set it to any non-empty string for the test (e.g. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=test npx npm run build`). In CI it will come from GitHub secrets.

## Test plan

No new test files. The CI workflow itself is the test — it verifies that the frontend builds, lints, and typechecks on every push and PR.

## Done criteria

- [ ] `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))"` exits 0 (valid YAML)
- [ ] `grep -n "setup-node" .github/workflows/test.yml` returns a match (Node setup added)
- [ ] `grep -n "npm run build" .github/workflows/test.yml` returns a match (build step added)
- [ ] `grep -n "tsc --noEmit" .github/workflows/test.yml` returns a match (typecheck step added)
- [ ] `grep -n "npm run lint" .github/workflows/test.yml` returns a match (lint step added)
- [ ] `grep -n "working-directory: app" .github/workflows/test.yml` returns at least 4 matches (all frontend steps use the right directory)
- [ ] No files outside `.github/workflows/test.yml` are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The CI file `.github/workflows/test.yml` doesn't match the excerpt in "Current state" (the codebase has drifted).
- `app/package-lock.json` does not exist (the cache step depends on it — if it's missing, STOP and report).
- `forge build` doesn't create `out/ArtisticAuras.sol/ArtisticAuras.json` (the frontend `postinstall` script reads this file — if the path or filename is different, STOP).
- Local verification (Step 2) fails on a clean checkout — report which command failed and the error.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- When frontend tests are added (future plan), add a `npm test` step after the lint step. The test runner should be configured in `app/package.json` first.
- If the `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` secret is not configured in GitHub, the build step will fail. The repo owner must add this secret in GitHub Settings → Secrets and Variables → Actions.
- If the frontend is ever moved out of the `app/` subdirectory (e.g. to the repo root), the `working-directory: app` directives and `cache-dependency-path` must be updated.
- The `postinstall` script creates `app/lib/abi.json` from Solidity build artifacts. If the contract name changes, the postinstall script in `app/package.json` must be updated too.
