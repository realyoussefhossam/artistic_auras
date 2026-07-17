# Plan 007: Remove tracked macOS system files and gitignore them

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- .gitignore special/__MACOSX special/special/.DS_Store`
> If any of these files changed since this plan was written, compare the "Current state" against the live repo before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

The repo currently tracks macOS system files (`special/__MACOSX/` and `special/special/.DS_Store`). These are not source assets; they clutter the repository and risk being accidentally re-committed whenever a macOS user touches the artwork directory. Adding standard gitignore entries and removing the tracked files keeps the repo clean.

## Current state

- `.gitignore:1-19`:

```gitignore
# Compiler files
cache/
out/
__pycache__/
*.pyc

# Commonly ignored directories
.logs/
.ignore/

# Ignores development broadcast logs
!/broadcast
/broadcast/*/31337/
/broadcast/**/dry-run/

# Dotenv file
.env
.env.*
!.env.example
```

- Tracked macOS files confirmed by:

```
special/__MACOSX/._special
special/__MACOSX/special/._.DS_Store
special/__MACOSX/special/._10.png
...
special/special/.DS_Store
```

(Complete list available via `git ls-files | grep -iE "DS_Store|__MACOSX"`.)

Repo conventions: `.gitignore` groups entries by category with comments. macOS entries fit under "Commonly ignored directories".

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| List tracked macOS files | `git ls-files | grep -iE "DS_Store\|__MACOSX"` | returns the file list before removal; empty after removal |
| Remove from git only | `git rm -r --cached special/__MACOSX special/special/.DS_Store` | files removed from index, still on disk |
| Verify gitignore | `git check-ignore special/__MACOSX special/special/.DS_Store` | exit 0, files ignored |
| Validate build/tests | `forge test -vvv` | 27 tests pass |

## Scope

**In scope**:
- `.gitignore`
- Remove `special/__MACOSX/` and `special/special/.DS_Store` from git tracking.

**Out of scope**:
- Any artwork PNG files under `special/special/`.
- Deleting the files from disk (only remove from git index so they remain locally).

## Git workflow

- Branch: `advisor/007-remove-macos-files`
- Commit message style: `chore: remove tracked macOS system files and gitignore them`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add macOS entries to `.gitignore`

Update `.gitignore` to include the standard macOS entries. Insert them under the "Commonly ignored directories" section:

```gitignore
# Compiler files
cache/
out/
__pycache__/
*.pyc

# Commonly ignored directories
.logs/
.ignore/
.DS_Store
__MACOSX/

# Ignores development broadcast logs
!/broadcast
/broadcast/*/31337/
/broadcast/**/dry-run/

# Dotenv file
.env
.env.*
!.env.example
```

**Verify**: `grep -E "^\.DS_Store$|^__MACOSX/$" .gitignore` → shows both lines.

### Step 2: Remove tracked macOS files from git

Run:

```bash
git rm -r --cached special/__MACOSX special/special/.DS_Store
```

This removes the files from the git index but leaves them on disk.

**Verify**: `git ls-files | grep -iE "DS_Store|__MACOSX"` → returns no output.

### Step 3: Confirm the files are still present locally

**Verify**: `ls -la special/__MACOSX special/special/.DS_Store` → both still exist on disk.

### Step 4: Verify the repository still builds and tests pass

**Verify**: `forge test -vvv` → 27 tests pass (Solidity code is unaffected).

## Test plan

No code tests are needed. The verification is git state:
- `git ls-files` no longer lists macOS metadata.
- `git check-ignore` reports the paths as ignored.

## Done criteria

- [ ] `.gitignore` contains `.DS_Store` and `__MACOSX/`.
- [ ] `git ls-files | grep -iE "DS_Store|__MACOSX"` returns nothing.
- [ ] The files remain on disk (not deleted by `git rm`).
- [ ] `forge test -vvv` still passes.
- [ ] `plans/README.md` status row for plan 007 is updated to DONE.

## STOP conditions

Stop and report if:
- `git rm` would delete files from disk because `--cached` was omitted.
- `git ls-files` still shows macOS files after removal.
- The macOS files were already untracked in your working copy.

## Maintenance notes

- Future macOS users will automatically have their `.DS_Store` files ignored.
- If artwork directories are reorganized, ensure `__MACOSX/` and `.DS_Store` remain gitignored.
