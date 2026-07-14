import os
import requests
from pathlib import Path


def pin_directory_to_pinata(directory: Path, pinata_jwt: str) -> str:
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    files = []
    for file_path in sorted(directory.glob("*.json")):
        # Pinata needs a directory prefix to wrap files into a folder.
        filename = f"{directory.name}/{file_path.name}"
        files.append(("file", (filename, file_path.read_bytes())))

    headers = {"Authorization": f"Bearer {pinata_jwt}"}
    response = requests.post(url, files=files, headers=headers)
    response.raise_for_status()
    return response.json()["IpfsHash"]


if __name__ == "__main__":
    jwt = os.environ["PINATA_JWT"]
    cid = pin_directory_to_pinata(Path(__file__).parent.parent / "metadata", jwt)
    print(f"ipfs://{cid}/")
