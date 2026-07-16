import json
from pathlib import Path

import pytest

from cleanup_metadata import cleanup

ROOT = Path(__file__).parent.parent


def test_cleanup_generates_21_jsons_and_token_ids(tmp_path):
    out_dir = tmp_path / "out"
    metadata_dir = tmp_path / "metadata"
    cleanup(
        csv_path=ROOT / "metadata-Files.csv",
        image_dir=ROOT / "special" / "special",
        out_dir=out_dir,
        metadata_dir=metadata_dir,
    )

    token_ids = json.loads((out_dir / "token_ids.json").read_text())["tokenIds"]
    assert len(token_ids) == 21
    assert len(sorted(metadata_dir.glob("*.json"))) == 21
    assert token_ids[0] == 1
    assert token_ids[-1] == 21


def test_cleanup_generates_gallery_token_list(tmp_path):
    out_dir = tmp_path / "out"
    metadata_dir = tmp_path / "metadata"
    cleanup(
        csv_path=ROOT / "metadata-Files.csv",
        image_dir=ROOT / "special" / "special",
        out_dir=out_dir,
        metadata_dir=metadata_dir,
    )

    tokens = json.loads((out_dir / "tokens.json").read_text())
    assert len(tokens) == 21
    assert all(t["image"].startswith("ipfs://") for t in tokens)


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
