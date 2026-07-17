# Plan 003: Add Python tests to CI

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- .github/workflows/test.yml`
> If `.github/workflows/test.yml` changed since this plan was written, compare the "Current state" excerpt against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 002
- **Category**: dx / tests
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

The CI workflow exercises the Solidity contract but never runs the Python cleanup tests. Because the metadata pipeline is a launch requirement, regressions in `scripts/cleanup_metadata.py` would only be caught locally. Adding a Python test step to CI closes that gap. This plan must run after plan 002 because the current tests mutate the repo artwork directory, which would be unsafe in CI.

## Current state

- `.github/workflows/test.yml` — CI workflow with only Forge steps.

Relevant excerpt (`test.yml:25-35`):

```yaml
      - name: Run Forge fmt
        run: forge fmt --check

      - name: Run Forge build
        run: forge build --sizes

      - name: Run Forge tests
        run: forge test -vvv
```

- `scripts/requirements.txt` exists and lists `pytest>=8.0.0` and `requests>=2.31.0`.
- `scripts/test_cleanup_metadata.py` is the test file to run.

Repo conventions: single CI job named `check`, runs on `ubuntu-latest`, steps are named and use `run` for shell commands.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Local Python tests | `python3 -m pip install -r scripts/requirements.txt && python3 -m pytest scripts/test_cleanup_metadata.py -v` | 3 tests pass |
| Validate workflow syntax | `forge test -vvv` (local sanity) | 27 tests pass |

## Scope

**In scope**:
- `.github/workflows/test.yml`

**Out of scope**:
- The Python cleanup script logic itself (covered by plan 002).
- Adding new Python dependencies.

## Git workflow

- Branch: `advisor/003-add-python-tests-to-ci`
- Commit message style: `ci: run Python metadata tests in CI`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add Python setup and test steps

Insert the following steps after the "Run Forge tests" step in `.github/workflows/test.yml`:

```yaml
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Python dependencies
        run: python3 -m pip install -r scripts/requirements.txt

      - name: Run Python metadata tests
        run: python3 -m pytest scripts/test_cleanup_metadata.py -v
```

The final job should look like:

```yaml
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

**Verify**: `grep -A3 "Run Python metadata tests" .github/workflows/test.yml` → shows the pytest command.

### Step 2: Run the Python tests locally to confirm they pass in this repo

**Verify**: `python3 -m pip install -r scripts/requirements.txt && python3 -m pytest scripts/test_cleanup_metadata.py -v` → `3 passed`.

## Test plan

No new tests are added in this plan; it wires the existing `scripts/test_cleanup_metadata.py` into CI. The tests themselves are improved by plan 002 so they do not mutate the checkout.

## Done criteria

- [ ] `.github/workflows/test.yml` contains a step named `Run Python metadata tests` that runs `python3 -m pytest scripts/test_cleanup_metadata.py -v`.
- [ ] Python setup and dependency-install steps precede the test step.
- [ ] The workflow still includes the existing Forge steps.
- [ ] Local run of the pytest command passes with 3 tests.
- [ ] `plans/README.md` status row for plan 003 is updated to DONE.

## STOP conditions

Stop and report if:
- The workflow file has drifted from the excerpt above.
- Plan 002 is not yet merged/done — the Python tests would mutate CI's checkout.
- `pytest` fails locally.

## Maintenance notes

- If more Python scripts gain tests, expand the pytest invocation to `python3 -m pytest scripts/ -v`.
- Keep Python and Foundry steps in the same job for now; split into jobs only if setup time becomes a bottleneck.
