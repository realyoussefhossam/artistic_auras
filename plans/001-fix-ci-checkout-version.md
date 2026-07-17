# Plan 001: Fix CI checkout action version

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- .github/workflows/test.yml`
> If `.github/workflows/test.yml` changed since this plan was written, compare the "Current state" excerpt against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

The CI workflow currently references `actions/checkout@v6`. That major version does not exist, so every push and pull request will fail at the checkout step before any tests run. Pinning to the current stable major version restores CI and avoids a broken build signal for all future changes.

## Current state

- `.github/workflows/test.yml` — GitHub Actions CI workflow.

Relevant excerpt (`test.yml:17`):

```yaml
      - uses: actions/checkout@v6
```

The repo convention is to keep all CI steps in this single workflow file. No other workflow files exist.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Verify fix | `grep "actions/checkout@v7" .github/workflows/test.yml` | prints the matching line |
| Local build | `forge build` | exit 0 |
| Local tests | `forge test -vvv` | all 27 tests pass |

## Scope

**In scope**:
- `.github/workflows/test.yml`

**Out of scope**:
- Any other workflow file or CI behavior.
- Version bumps for other actions.

## Git workflow

- Branch: `advisor/001-fix-ci-checkout-version`
- Commit message style (from `git log`): `ci: use actions/checkout@v7`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Update the checkout action version

Change line 17 of `.github/workflows/test.yml` from `actions/checkout@v6` to `actions/checkout@v7`.

```yaml
      - uses: actions/checkout@v7
```

**Verify**: `grep "actions/checkout@v7" .github/workflows/test.yml` → outputs the line containing `actions/checkout@v7`.

### Step 2: Confirm no unrelated changes

**Verify**: `git diff -- .github/workflows/test.yml` → only the version number changed.

### Step 3: Confirm build and tests still pass locally

**Verify**: `forge build` → exit 0.
**Verify**: `forge test -vvv` → `Suite result: ok. 27 passed; 0 failed`.

## Test plan

No new tests are needed; this is a CI configuration fix. The existing `forge test -vvv` and `forge fmt --check` steps in the workflow provide regression coverage once CI runs.

## Done criteria

- [ ] `.github/workflows/test.yml` references `actions/checkout@v7`.
- [ ] `git diff` for that file only changes the action version.
- [ ] `forge build` exits 0.
- [ ] `forge test -vvv` passes with 27 tests.
- [ ] `plans/README.md` status row for plan 001 is updated to DONE.

## STOP conditions

Stop and report if:
- The checkout line in `.github/workflows/test.yml` does not match the excerpt above (drift).
- `forge test -vvv` fails for reasons unrelated to the CI file change.
- Other unrelated changes appear in the diff.

## Maintenance notes

- Reviewers should verify the chosen action version is still the current stable major release at merge time.
- Do not pin to a floating `@main` reference; the repo uses major-version tags for GitHub Actions.
