const PRIMARY_GATEWAY = "https://cloudflare-ipfs.com/ipfs/";
const FALLBACK_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export function resolveIpfsUri(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("http")) return uri;
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7);
    return `${PRIMARY_GATEWAY}${path}`;
  }
  if (uri.startsWith("Qm") || uri.startsWith("baf")) {
    return `${PRIMARY_GATEWAY}${uri}`;
  }
  return uri;
}

export function resolveIpfsUriFallback(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("http")) return uri;
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7);
    return `${FALLBACK_GATEWAY}${path}`;
  }
  if (uri.startsWith("Qm") || uri.startsWith("baf")) {
    return `${FALLBACK_GATEWAY}${uri}`;
  }
  return uri;
}
