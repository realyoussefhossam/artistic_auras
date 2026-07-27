"use client";

import { type ReactNode, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/app/wagmi";

export interface ProviderProps {
  children: ReactNode;
}

const emptySubscribe = () => () => {};

const RAINBOW_ACCENT = "#6366f1";

export function Providers({ children }: Readonly<ProviderProps>) {
  const [queryClient] = useState(() => new QueryClient());
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const appInfo = { appName: "Artistic Auras" };

  if (!mounted) {
    return null;
  }

  const rainbowTheme =
    resolvedTheme === "dark"
      ? darkTheme({ accentColor: RAINBOW_ACCENT, accentColorForeground: "#ffffff", borderRadius: "medium" })
      : lightTheme({ accentColor: RAINBOW_ACCENT, accentColorForeground: "#ffffff", borderRadius: "medium" });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={appInfo} theme={rainbowTheme} initialChain={sepolia}>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
