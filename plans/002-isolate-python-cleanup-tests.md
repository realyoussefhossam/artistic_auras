# Plan 002: Isolate Python cleanup tests from real artwork directory

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 791c072..HEAD -- scripts/test_cleanup_metadata.py`
> If `scripts/test_cleanup_metadata.py` changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `791c072`, 2026-07-17

## Why this matters

The Python cleanup tests currently pass `ROOT / "special" / "special"` as the image directory, and the cleanup function calls `shutil.move` inside that directory to lowercase `.png` extensions. Running `pytest` therefore mutates the actual repository artwork files. The tests pass today only because the files are already lowercase; on a fresh checkout with `.PNG` files the tests would modify the repo and could fail or corrupt committed assets. Isolating the tests with a per-test temporary copy makes them deterministic and safe.

## Current state

- `scripts/cleanup_metadata.py` — cleanup implementation; `cleanup(...)` takes an `image_dir` argument and calls `shutil.move(src, dst)` to rename images.
- `scripts/test_cleanup_metadata.py` — three tests, each passing the real repo directory as `image_dir`.

Relevant excerpts:

`scripts/test_cleanup_metadata.py:11-19`:
```python
def test_cleanup_generates_21_jsons_and_token_ids(tmp_path):
    out_dir = tmp_path / "out"
    metadata_dir = tmp_path / "metadata"
    cleanup(
        csv_path=ROOT / "metadata-Files.csv",
        image_dir=ROOT / "special" / "special",
        out_dir=out_dir,
        metadata_dir=metadata_dir,
    )
```

`scripts/test_cleanup_metadata.py:43-56`:
```python
def test_cleanup_renames_images_to_lowercase_png(tmp_path):
    out_dir = tmp_path / "out"
    metadata_dir = tmp_path / "metadata"
    cleanup(
        csv_path=ROOT / "metadata-Files.csv",
        image_dir=ROOT / "special" / "special",
        out_dir=out_dir,
        metadata_dir=metadata_dir,
    )

    image_files = sorted((ROOT / "special" / "special").glob("*.png"))
    assert len(image_files) == 21
    assert not any(f.suffix != ".png" for f in image_files)
    assert not any((ROOT / "special" / "special").glob("*.PNG"))
```

`scripts/cleanup_metadata.py:66-69`:
```python
        src = _find_existing_image_path(image_dir, base)
        dst = image_dir / normalized_file
        if src != dst:
            shutil.move(src, dst)
```

Repo conventions: tests use `tmp_path` for generated outputs and assert against it; do not modify source assets.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Run Python tests | `python3 -m pytest scripts/test_cleanup_metadata.py -v` | 3 tests pass |
| Verify no real dir mutation | `git status --short` after tests | no changes under `special/` |
| Check for leftover real-dir references | `grep -n "ROOT / \"special\" / \"special\"" scripts/test_cleanup_metadata.py` | no matches (or only in `csv_path`) |

## Scope

**In scope**:
- `scripts/test_cleanup_metadata.py`

**Out of scope**:
- `scripts/cleanup_metadata.py` — the cleanup implementation is correct; only its test harness changes.
- The real `special/special/` artwork files.

## Git workflow

- Branch: `advisor/002-isolate-python-cleanup-tests`
- Commit message style: `test: isolate cleanup tests from real artwork directory`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a fixture that copies artwork into tmp_path

Add the helper below at the top of `scripts/test_cleanup_metadata.py` after the `ROOT` constant. It creates a temporary copy of the real artwork directory for each test.

```python
import shutil


def _copy_image_dir(target: Path) -> Path:
    src = ROOT / "special" / "special"
    dst = target / "special"
    shutil.copytree(src, dst)
    return dst
```

Leave `ROOT` and the imports unchanged except for adding `import shutil`.

### Step 2: Rewrite each test to use the temporary image directory

Update the three test functions so they call `_copy_image_dir(tmp_path)` and pass the returned path as `image_dir`. Also update the assertions in `test_cleanup_renames_images_to_lowercase_png` to inspect the temporary directory, not `ROOT / "special" / "special"`.

Example final shape for the first test:

```python
def test_cleanup_generates_21_jsons_and_token_ids(tmp_path):
    image_dir = _copy_image_dir(tmp_path)
    out_dir = tmp_path / "out"
    metadata_dir = tmp_path / "metadata"
    cleanup(
        csv_path=ROOT / "metadata-Files.csv",
        image_dir=image_dir,
        out_dir=out_dir,
        metadata_dir=metadata_dir,
    )

    token_ids = json.loads((out_dir / "token_ids.json").read_text())["tokenIds"]
    assert len(token_ids) == 21
    assert len(sorted(metadata_dir.glob("*.json"))) == 21
    assert token_ids[0] == 1
    assert token_ids[-1] == 21
```

Apply the same pattern to `test_cleanup_generates_gallery_token_list` and `test_cleanup_renames_images_to_lowercase_png`.

For `test_cleanup_renames_images_to_lowercase_png`, the assertions should use `image_dir`:

```python
    image_files = sorted(image_dir.glob("*.png"))
    assert len(image_files) == 21
    assert not any(f.suffix != ".png" for f in image_files)
    assert not any(image_dir.glob("*.PNG"))
```

**Verify**: `grep -n "ROOT / \"special\" / \"special\"" scripts/test_cleanup_metadata.py` → returns only the `csv_path` line (or no matches if you moved that too, but keep `csv_path` pointing to the real CSV).

### Step 3: Run the tests and confirm isolation

**Verify**: `python3 -m pytest scripts/test_cleanup_metadata.py -v` → `3 passed`.
**Verify**: `git status --short` → no changes under `special/`. (A few lines of untracked `metadata/` and `out/` content are acceptable; the real artwork files must be untouched.)

## Test plan

- Existing tests remain the same three cases: JSON generation, gallery token list, and image lowercasing.
- New regression coverage: tests now prove cleanup works against a copy, and assertions no longer depend on the state of the real `special/special/` directory.

## Done criteria

- [ ] `scripts/test_cleanup_metadata.py` uses a temporary copy of the artwork directory in all three tests.
- [ ] No test passes `ROOT / "special" / "special"` as `image_dir`.
- [ ] `python3 -m pytest scripts/test_cleanup_metadata.py -v` passes with 3 tests.
- [ ] Running the tests does not modify files under `special/` (verified via `git status`).
- [ ] `plans/README.md` status row for plan 002 is updated to DONE.

## STOP conditions

Stop and report if:
- The test file does not match the excerpts above (drift).
- `pytest` fails after the refactor.
- The real `special/special/` directory still shows changes after tests run.

## Maintenance notes

- If the cleanup function later gains the ability to operate in place or delete source files, this test isolation pattern still applies: tests must not touch committed assets.
- Reviewers should confirm the helper copies all 21 images and that assertions target the copy.
