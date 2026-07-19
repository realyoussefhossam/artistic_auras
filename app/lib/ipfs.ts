const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const IPFS_IO_GATEWAY = "https://ipfs.io/ipfs/";

export function resolveIpfsUri(uri: string): string {
  if (!uri) return "";
  // Already an HTTP URL
  if (uri.startsWith("http")) return uri;
  // ipfs://<cid>/<path>
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7);
    return `${PINATA_GATEWAY}${path}`;
  }
  // Bare CID
  if (uri.startsWith("Qm") || uri.startsWith("baf")) {
    return `${PINATA_GATEWAY}${uri}`;
  }
  return uri;
}

export function resolveIpfsUriFallback(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("http")) return uri;
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7);
    return `${IPFS_IO_GATEWAY}${path}`;
  }
  if (uri.startsWith("Qm") || uri.startsWith("baf")) {
    return `${IPFS_IO_GATEWAY}${uri}`;
  }
  return uri;
}
