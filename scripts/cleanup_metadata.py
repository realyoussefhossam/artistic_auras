import csv
import json
import re
import shutil
from pathlib import Path


def _parse_image_cid(url: str) -> str:
    if url.startswith("https://gateway.pinata.cloud/ipfs/"):
        return f"ipfs://{url.split('/')[-1]}"
    if url.startswith("ipfs://"):
        return url
    raise ValueError(f"Unrecognized image URL: {url}")


def _attribute_key_to_trait_type(key: str) -> str:
    # key looks like "attributes[Color Scheme]"
    match = re.search(r"attributes\[(.+?)\]", key, re.IGNORECASE)
    if not match:
        return key.strip().title()
    return match.group(1).strip().title()


def _find_existing_image_path(image_dir: Path, base_name: str) -> Path:
    for file_path in image_dir.iterdir():
        if file_path.is_file() and file_path.stem.lower() == base_name.lower():
            return file_path
    raise FileNotFoundError(
        f"No image file found for base name '{base_name}' in {image_dir}"
    )


def cleanup(csv_path: Path, image_dir: Path, out_dir: Path, metadata_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    metadata_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, skipinitialspace=True)
        for row in reader:
            rows.append(row)

    token_ids = []
    cleaned_rows = []
    token_list = []

    for row in rows:
        token_id_str = row["tokenID"].strip()
        token_id = int(token_id_str)
        token_ids.append(token_id)

        original_file = row["file_name"].strip()
        name = row["name"].strip()
        description = row["description"].strip()
        # CSV descriptions are wrapped in double quotes; strip them.
        if description.startswith('"') and description.endswith('"'):
            description = description[1:-1]

        # Normalize image filename to lowercase .png
        base = Path(original_file).stem
        normalized_file = f"{base}.png"
        src = _find_existing_image_path(image_dir, base)
        dst = image_dir / normalized_file
        if src != dst:
            shutil.move(src, dst)

        attributes = []
        for key, value in row.items():
            if key and "attributes" in key.lower() and value.strip():
                trait_type = _attribute_key_to_trait_type(key)
                attributes.append({"trait_type": trait_type, "value": value.strip()})

        metadata = {
            "name": name,
            "description": description,
            "image": _parse_image_cid(row["Image CID on Pinata"].strip()),
            "attributes": attributes,
        }

        json_path = metadata_dir / f"{token_id}.json"
        json_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

        cleaned_row = {
            "tokenID": token_id_str,
            "name": name,
            "description": description,
            "file_name": normalized_file,
            "image_cid": metadata["image"],
        }
        cleaned_rows.append(cleaned_row)

        token_list.append(
            {
                "tokenId": token_id,
                "name": name,
                "image": metadata["image"],
            }
        )

    (out_dir / "tokens.json").write_text(
        json.dumps(token_list, indent=2), encoding="utf-8"
    )

    (out_dir / "token_ids.json").write_text(
        json.dumps({"tokenIds": token_ids}, indent=2), encoding="utf-8"
    )

    cleaned_csv_path = out_dir / "metadata-Files.cleaned.csv"
    with cleaned_csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "tokenID",
                "name",
                "description",
                "file_name",
                "image_cid",
            ],
        )
        writer.writeheader()
        writer.writerows(cleaned_rows)


if __name__ == "__main__":
    root = Path(__file__).parent.parent
    cleanup(
        csv_path=root / "metadata-Files.csv",
        image_dir=root / "special" / "special",
        out_dir=root / "out",
        metadata_dir=root / "metadata",
    )
