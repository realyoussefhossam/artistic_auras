"use client";

import { type ReactNode, useState } from "react";

import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/app/wagmi";

export interface ProviderProps {
  children: ReactNode;
}

const RAINBOW_ACCENT = "#6366f1";

export function Providers({ children }: Readonly<ProviderProps>) {
  const [queryClient] = useState(() => new QueryClient());

  const appInfo = { appName: "Artistic Auras" };

  const rainbowTheme = lightTheme({
    accentColor: RAINBOW_ACCENT,
    accentColorForeground: "#ffffff",
    borderRadius: "medium",
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={appInfo} theme={rainbowTheme} initialChain={mainnet}>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
