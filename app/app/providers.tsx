"use client";

import { type ReactNode, useState, useSyncExternalStore } from "react";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/app/wagmi";

export interface ProviderProps {
  children: ReactNode;
}

const emptySubscribe = () => () => {};

export function Providers({ children }: Readonly<ProviderProps>) {
  const [queryClient] = useState(() => new QueryClient());
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const appInfo = { appName: "Artistic Auras" };

  // Prevent hydration issues by only rendering once mounted
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={appInfo}
          theme={darkTheme({
            accentColor: "#7c3aed",
            accentColorForeground: "#ffffff",
            borderRadius: "medium",
          })}
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
