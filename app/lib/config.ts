import { sepolia, mainnet } from "wagmi/chains";

export const chains = [sepolia, mainnet] as const;

export const defaultChain =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 1 ? mainnet : sepolia;

export const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
