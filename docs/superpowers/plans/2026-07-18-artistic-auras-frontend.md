# Artistic Auras Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 frontend with three pages (Landing, Mint, Gallery) that connects to the ArtisticAuras ERC-721 contract on Sepolia, with dark glassmorphism styling and a WebGL aurora background.

**Architecture:** Static Next.js App Router pages with client-side wagmi hooks for all contract reads/writes. Monorepo structure — frontend lives in `app/` subdir. shadcn/ui for primitives, custom components for NFT-specific UI.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, wagmi v2, viem v2, RainbowKit, shadcn/ui, Framer Motion, next/font (Space Grotesk + Inter)

## Global Constraints

- Node.js v24+ and npm v11+ required (already installed: v24.18.0 / 11.16.0)
- TypeScript strict mode, no `any` types
- All contract addresses hardcoded for Sepolia: `0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5`
- Mainnet address placeholder: `0x0000000000000000000000000000000000000000` (TBD)
- IPFS gateway primary: `https://gateway.pinata.cloud/ipfs/`
- IPFS gateway fallback: `https://ipfs.io/ipfs/`
- Background color: `#0a0a0f`; card color: `#1a1a2e`; accents: `#7c3aed`, `#ec4899`, `#f59e0b`
- Fonts: Space Grotesk (headings), Inter (body) via `next/font/google`
- No admin UI in the frontend
- `npm run build` must pass with zero errors
- `npm run lint` must pass
- Bundle size target: < 500KB (excluding fonts)

---

## File Structure

```
app/
├── app/
│   ├── layout.tsx              # Root layout: fonts, providers, aurora bg
│   ├── page.tsx                # Landing page
│   ├── mint/
│   │   └── page.tsx            # Mint page
│   └── gallery/
│       └── page.tsx            # Gallery page
├── components/
│   ├── providers.tsx           # WagmiConfig + RainbowKitProvider + Toaster
│   ├── Header.tsx              # Nav bar + ConnectButton
│   ├── MintButton.tsx          # Mint logic + transaction states
│   ├── MintSuccessModal.tsx    # Success dialog with NFT preview
│   ├── NFTCard.tsx             # Gallery card with hover effects
│   ├── NFTModal.tsx            # Detail modal with full metadata
│   ├── AuroraBackground.tsx    # WebGL fragment shader
│   ├── StatsBar.tsx            # Pill-shaped stat chips
│   └── ui/                     # shadcn/ui generated components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── tooltip.tsx
│       └── sonner.tsx
├── hooks/
│   ├── read/
│   │   ├── usePublicSaleActive.ts
│   │   ├── useTotalSupply.ts
│   │   ├── useMintPrice.ts
│   │   ├── useMaxSupply.ts
│   │   ├── useTokenURI.ts
│   │   └── useOwnerOf.ts
│   └── write/
│       └── useMint.ts
├── lib/
│   ├── contract.ts             # ABI import + contract config
│   ├── config.ts               # Chain config for wagmi
│   ├── ipfs.ts                 # IPFS gateway helpers
│   └── abi.json                # Auto-copied from Foundry out/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json             # shadcn/ui config
├── .env.local.example
└── globals.css                 # Theme variables + Tailwind
```

---

### Task 1: Scaffold Next.js project in `app/`

**Files:**
- Create: `app/package.json`
- Create: `app/next.config.js`
- Create: `app/tsconfig.json`
- Create: `app/tailwind.config.ts`
- Create: `app/postcss.config.js`
- Create: `app/app/layout.tsx`
- Create: `app/app/page.tsx`
- Create: `app/globals.css`
- Create: `app/.env.local.example`
- Create: `app/lib/abi.json` (copied from `../out/`)

**Interfaces:**
- Produces: a runnable Next.js dev server at `http://localhost:3000` with Tailwind CSS configured and the ABI available at `app/lib/abi.json`

- [x] **Step 1: Create the Next.js app**

Run from the repo root:
```bash
npx create-next-app@14 app --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```

This creates `app/` with Next.js 14, TypeScript, Tailwind, ESLint, App Router, and `@/*` import alias.

- [ x ok server starts and run ] **Step 2: Verify the scaffold runs**

```bash
cd app && npm run dev
```

Expected: dev server starts on `http://localhost:3000`, default Next.js page loads.

- [ x ok verifyed the abi is now also at app/lib/abi.json ] **Step 3: Copy the contract ABI**

Create `app/lib/abi.json` by copying the ABI from the Foundry output:

```bash
cd app && mkdir -p lib && node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('../out/ArtisticAuras.sol/ArtisticAuras.json')); fs.writeFileSync('lib/abi.json', JSON.stringify(d.abi, null, 2));"
```

Verify: `cat app/lib/abi.json | head -5` should show JSON starting with `[{`.

- [ x done ] **Step 4: Add the postinstall script to copy ABI**

Edit `app/package.json` and add to the `scripts` section:

```json
{
  "scripts": {
    "postinstall": "node -e \"const fs=require('fs'); const d=JSON.parse(fs.readFileSync('../out/ArtisticAuras.sol/ArtisticAuras.json')); fs.writeFileSync('lib/abi.json', JSON.stringify(d.abi, null, 2));\""
  }
}
```

Keep the existing `dev`, `build`, `start`, `lint` scripts.

- [ x done ] **Step 5: Create `.env.local.example`**

Create `app/.env.local.example`:

```env
# Target chain ID (11155111 for Sepolia, 1 for Mainnet)
NEXT_PUBLIC_CHAIN_ID=11155111

# WalletConnect project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

- [ x done ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: scaffold Next.js 14 frontend in app/"
```

---

### Task 2: Install dependencies and configure Tailwind theme

**Files:**
- Modify: `app/package.json` (add deps)
- Modify: `app/tailwind.config.ts`
- Modify: `app/globals.css`
- Create: `app/lib/config.ts`

**Interfaces:**
- Produces: `config.ts` exports `sepolia` and `mainnet` chain configs, `defaultChain` based on env var

- [x] **Step 1: Install Web3 dependencies**

```bash
cd app && npm install wagmi@^2 viem@^2 @rainbow-me/rainbowkit@^2
```

- [x] **Step 2: Install shadcn/ui dependencies**

```bash
cd app && npm install class-variance-authority clsx tailwind-merge lucide-react
```

- [x] **Step 3: Install Framer Motion and Sonner**

```bash
cd app && npm install framer-motion sonner
```

- [x] **Step 4: Create `lib/utils.ts` for shadcn**

Create `app/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [x] **Step 5: Create `components.json` for shadcn/ui**

Create `app/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 6: Update `tailwind.config.ts` with theme**

Replace `app/tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
```

- [x] **Step 7: Update `globals.css` with theme variables**

Replace `app/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 4%;
    --foreground: 0 0% 98%;
    --card: 240 10% 12%;
    --card-foreground: 0 0% 98%;
    --primary: 265 89% 62%;
    --primary-foreground: 0 0% 98%;
    --accent: 330 81% 60%;
    --accent-foreground: 0 0% 98%;
    --muted: 240 10% 16%;
    --muted-foreground: 240 5% 65%;
    --border: 0 0% 100% / 0.1;
    --ring: 265 89% 62%;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: var(--font-inter), sans-serif;
  }
}

@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .gradient-accent {
    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%);
  }
  .text-gradient {
    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

- [ ] **Step 8: Create `lib/config.ts` with chain config**

Create `app/lib/config.ts`:

```ts
import { sepolia, mainnet } from "wagmi/chains"

export const chains = [sepolia, mainnet] as const

export const defaultChain =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 1 ? mainnet : sepolia

export const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? ""
```

- [ ] **Step 9: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 10: Commit**

```bash
git add app/
git commit -m "feat: install web3 deps and configure dark theme"
```

---

### Task 3: Add shadcn/ui components

**Files:**
- Create: `app/components/ui/button.tsx`
- Create: `app/components/ui/dialog.tsx`
- Create: `app/components/ui/input.tsx`
- Create: `app/components/ui/badge.tsx`
- Create: `app/components/ui/tooltip.tsx`
- Create: `app/components/ui/sonner.tsx`

**Interfaces:**
- Produces: shadcn/ui components available at `@/components/ui/*`

- [x] **Step 1: Add shadcn/ui Button component**

Create `app/components/ui/button.tsx`:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-border bg-transparent hover:bg-white/5",
        secondary: "bg-muted text-foreground hover:bg-muted/80",
        ghost: "hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 2: Install Radix UI primitives**

```bash
cd app && npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-tooltip
```

- [x] **Step 3: Add Dialog component**

Create `app/components/ui/dialog.tsx`:

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}
```

- [x] **Step 4: Add Input, Badge, Tooltip, and Sonner components**

Create `app/components/ui/input.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

Create `app/components/ui/badge.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-muted text-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-green-500/20 text-green-400",
        destructive: "border-transparent bg-red-500/20 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
```

Create `app/components/ui/tooltip.tsx`:

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-white/10 bg-card px-3 py-1.5 text-xs text-foreground shadow-md",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

Create `app/components/ui/sonner.tsx`:

```tsx
"use client"

import { Toaster as Sonner } from "sonner"

const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(240 10% 12%)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "hsl(0 0% 98%)",
        },
      }}
    />
  )
}

export { Toaster }
```

- [ ] **Step 5: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: add shadcn/ui components (button, dialog, input, badge, tooltip, sonner)"
```

---

### Task 4: Create contract config and IPFS helpers

**Files:**
- Create: `app/lib/contract.ts`
- Create: `app/lib/ipfs.ts`

**Interfaces:**
- Produces: `contract.ts` exports `contractABI`, `contractAddress`, `contractConfig`
- Produces: `ipfs.ts` exports `ipfsToHttps`, `fetchMetadata`, `NFTMetadata` type

- [ ] **Step 1: Create `lib/contract.ts`**

Create `app/lib/contract.ts`:

```ts
import { abi } from "./abi.json"
import { sepolia, mainnet } from "wagmi/chains"

export const contractABI = abi as const

export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  [sepolia.id]: "0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5",
  [mainnet.id]: "0x0000000000000000000000000000000000000000",
}

export function getContractAddress(chainId: number): `0x${string}` {
  const addr = CONTRACT_ADDRESSES[chainId]
  if (!addr) throw new Error(`No contract address for chain ${chainId}`)
  return addr
}
```

- [ ] **Step 2: Create `lib/ipfs.ts`**

Create `app/lib/ipfs.ts`:

```ts
const PRIMARY_GATEWAY = "https://gateway.pinata.cloud/ipfs/"
const FALLBACK_GATEWAY = "https://ipfs.io/ipfs/"

const metadataCache = new Map<string, NFTMetadata>()

export interface NFTAttribute {
  trait_type: string
  value: string | number
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
}

export function ipfsToHttps(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7)
    return `${PRIMARY_GATEWAY}${path}`
  }
  return uri
}

function ipfsToHttpsFallback(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7)
    return `${FALLBACK_GATEWAY}${path}`
  }
  return uri
}

export async function fetchMetadata(tokenURI: string): Promise<NFTMetadata> {
  const cached = metadataCache.get(tokenURI)
  if (cached) return cached

  const primaryUrl = ipfsToHttps(tokenURI)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(primaryUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: NFTMetadata = await res.json()
    metadataCache.set(tokenURI, data)
    return data
  } catch {
    const fallbackUrl = ipfsToHttpsFallback(tokenURI)
    const res = await fetch(fallbackUrl)
    if (!res.ok) throw new Error(`Failed to fetch metadata from both gateways`)
    const data: NFTMetadata = await res.json()
    metadataCache.set(tokenURI, data)
    return data
  }
}
```

- [ ] **Step 3: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: add contract config and IPFS metadata helpers"
```

---

### Task 5: Create wagmi/RainbowKit providers

**Files:**
- Create: `app/components/providers.tsx`
- Modify: `app/app/layout.tsx`

**Interfaces:**
- Produces: `Providers` component wrapping app with `WagmiConfig`, `RainbowKitProvider`, `TooltipProvider`, `Toaster`

- [ ] **Step 1: Create `components/providers.tsx`**

Create `app/components/providers.tsx`:

```tsx
"use client"

import { WagmiProvider, createConfig, http } from "wagmi"
import { sepolia, mainnet } from "wagmi/chains"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { wcProjectId, defaultChain } from "@/lib/config"

const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7c3aed",
            accentColorForeground: "#ffffff",
            borderRadius: "medium",
          })}
          initialChain={defaultChain.id}
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

- [ ] **Step 2: Install tanstack react-query**

```bash
cd app && npm install @tanstack/react-query
```

- [ ] **Step 3: Update `app/layout.tsx` with fonts and providers**

Replace `app/app/layout.tsx` with:

```tsx
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Artistic Auras",
  description: "A 21-piece abstract NFT collection capturing cosmic energy and vibrant expressionism on Ethereum.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat: add wagmi/RainbowKit providers and root layout"
```

---

### Task 6: Create read hooks

**Files:**
- Create: `app/hooks/read/usePublicSaleActive.ts`
- Create: `app/hooks/read/useTotalSupply.ts`
- Create: `app/hooks/read/useMintPrice.ts`
- Create: `app/hooks/read/useMaxSupply.ts`
- Create: `app/hooks/read/useTokenURI.ts`
- Create: `app/hooks/read/useOwnerOf.ts`

**Interfaces:**
- Consumes: `contractABI`, `getContractAddress` from `@/lib/contract`
- Produces: six hooks that wrap `useReadContract` for specific contract functions

- [ ] **Step 1: Create `usePublicSaleActive`**

Create `app/hooks/read/usePublicSaleActive.ts`:

```ts
import { useReadContract } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"

export function usePublicSaleActive(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "publicSaleActive",
  })
}
```

- [ ] **Step 2: Create `useTotalSupply`**

Create `app/hooks/read/useTotalSupply.ts`:

```ts
import { useReadContract } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"

export function useTotalSupply(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "getTotalSupply",
  })
}
```

- [ ] **Step 3: Create `useMintPrice`**

Create `app/hooks/read/useMintPrice.ts`:

```ts
import { useReadContract } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"

export function useMintPrice(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "MINT_PRICE",
  })
}
```

- [ ] **Step 4: Create `useMaxSupply`**

Create `app/hooks/read/useMaxSupply.ts`:

```ts
import { useReadContract } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"

export function useMaxSupply(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "MAX_SUPPLY",
  })
}
```

- [ ] **Step 5: Create `useTokenURI`**

Create `app/hooks/read/useTokenURI.ts`:

```ts
import { useReadContract } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"

export function useTokenURI(chainId: number, tokenId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  })
}
```

- [ ] **Step 6: Create `useOwnerOf`**

Create `app/hooks/read/useOwnerOf.ts`:

```ts
import { useReadContract } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"

export function useOwnerOf(chainId: number, tokenId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  })
}
```

- [ ] **Step 7: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/
git commit -m "feat: add contract read hooks"
```

---

### Task 7: Create write hook (useMint)

**Files:**
- Create: `app/hooks/write/useMint.ts`

**Interfaces:**
- Consumes: `contractABI`, `getContractAddress` from `@/lib/contract`
- Produces: `useMint` hook returning `{ writeContractAsync, isPending, data, error }`

- [ ] **Step 1: Create `useMint`**

Create `app/hooks/write/useMint.ts`:

```ts
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractABI, getContractAddress } from "@/lib/contract"
import { parseEther } from "viem"

export function useMint(chainId: number) {
  const {
    writeContractAsync,
    isPending,
    data: txHash,
    error: writeError,
    reset,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash })

  async function mint(quantity: number, mintPrice: bigint) {
    const address = getContractAddress(chainId)
    const value = mintPrice * BigInt(quantity)

    return writeContractAsync({
      abi: contractABI,
      address,
      functionName: "mint",
      args: [BigInt(quantity)],
      value,
    })
  }

  return {
    mint,
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    receipt,
    error: writeError ?? receiptError,
    reset,
  }
}
```

- [ ] **Step 2: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: add useMint write hook"
```

---

### Task 8: Create AuroraBackground component

**Files:**
- Create: `app/components/AuroraBackground.tsx`

**Interfaces:**
- Produces: `AuroraBackground` component rendering a fixed WebGL canvas with flowing aurora shader, CSS gradient fallback

- [ ] **Step 1: Create `AuroraBackground.tsx`**

Create `app/components/AuroraBackground.tsx`:

```tsx
"use client"

import { useEffect, useRef } from "react"

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    for (float i = 0.0; i < 4.0; i++) {
      uv = fract(uv * 1.5) - 0.5;
      float d = length(uv) * exp(-length(uv0) * 1.5);
      vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.15);
      d = sin(d * 8.0 + u_time) / 8.0;
      d = abs(d);
      d = pow(0.01 / d, 1.2);
      finalColor += col * d;
    }

    gl_FragColor = vec4(finalColor, 0.4);
  }
`

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl) {
      canvas.style.display = "none"
      return
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, "u_time")
    const resLoc = gl.getUniformLocation(program, "u_resolution")

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const start = performance.now()
    let isVisible = true

    const render = () => {
      if (isVisible) {
        const time = (performance.now() - start) / 1000
        gl.uniform1f(timeLoc, time)
        gl.uniform2f(resLoc, canvas.width, canvas.height)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      animationRef.current = requestAnimationFrame(render)
    }
    render()

    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibility)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      />
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)",
        }}
      />
    </>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: add AuroraBackground WebGL shader component"
```

---

### Task 9: Create Header and StatsBar components

**Files:**
- Create: `app/components/Header.tsx`
- Create: `app/components/StatsBar.tsx`

**Interfaces:**
- Consumes: RainbowKit `ConnectButton`, `useMaxSupply`, `useMintPrice`, contract read hooks
- Produces: `Header` with nav + connect button, `StatsBar` with pill-shaped stat chips

- [ ] **Step 1: Create `Header.tsx`**

Create `app/components/Header.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { motion } from "framer-motion"

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-xl font-bold text-gradient">
          Artistic Auras
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Gallery
          </Link>
          <Link href="/mint" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Mint
          </Link>
          <ConnectButton />
        </div>
      </nav>
    </motion.header>
  )
}
```

- [ ] **Step 2: Create `StatsBar.tsx`**

Create `app/components/StatsBar.tsx`:

```tsx
"use client"

import { useAccount } from "wagmi"
import { useMaxSupply } from "@/hooks/read/useMaxSupply"
import { useMintPrice } from "@/hooks/read/useMintPrice"
import { useTotalSupply } from "@/hooks/read/useTotalSupply"
import { Badge } from "@/components/ui/badge"
import { formatEther } from "viem"

export function StatsBar() {
  const { chain } = useAccount()
  const chainId = chain?.id ?? 11155111

  const { data: maxSupply } = useMaxSupply(chainId)
  const { data: mintPrice } = useMintPrice(chainId)
  const { data: totalSupply } = useTotalSupply(chainId)

  const stats = [
    { label: "Total Supply", value: maxSupply ? `${maxSupply.toString()}` : "—" },
    { label: "Minted", value: totalSupply ? `${totalSupply.toString()}` : "—" },
    { label: "Mint Price", value: mintPrice ? `${formatEther(mintPrice)} ETH` : "—" },
    { label: "Royalty", value: "5%" },
  ]

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass rounded-full px-5 py-2 flex items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">{stat.label}</span>
          <span className="text-sm font-semibold text-foreground">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: add Header and StatsBar components"
```

---

### Task 10: Create Landing page

**Files:**
- Modify: `app/app/page.tsx`
- Modify: `app/app/layout.tsx` (add Header + AuroraBackground)

**Interfaces:**
- Consumes: `Header`, `StatsBar`, `AuroraBackground`
- Produces: Landing page at `/` with hero, stats, CTAs

- [ ] **Step 1: Update `layout.tsx` to include Header and AuroraBackground**

Replace `app/app/layout.tsx` with:

```tsx
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/Header"
import { AuroraBackground } from "@/components/AuroraBackground"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Artistic Auras",
  description: "A 21-piece abstract NFT collection capturing cosmic energy and vibrant expressionism on Ethereum.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <AuroraBackground />
          <Header />
          <main className="relative z-10 pt-20">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create Landing page**

Replace `app/app/page.tsx` with:

```tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { StatsBar } from "@/components/StatsBar"
import { Sparkles, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center gap-8"
      >
        <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">21 unique pieces</span>
        </div>

        <h1 className="font-heading text-6xl md:text-8xl font-bold text-gradient">
          Artistic Auras
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          A 21-piece abstract NFT collection capturing cosmic energy, organic forms,
          and vibrant expressionism on Ethereum.
        </p>

        <StatsBar />

        <div className="flex gap-4 mt-8">
          <Link href="/mint">
            <Button size="lg" className="gradient-accent text-white">
              Mint Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/gallery">
            <Button size="lg" variant="outline">
              View Gallery
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build and run dev**

```bash
cd app && npm run build
```

Expected: build succeeds.

```bash
cd app && npm run dev
```

Expected: `http://localhost:3000` shows the landing page with aurora background, stats bar, and CTA buttons.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: add landing page with hero, stats, and CTAs"
```

---

### Task 11: Create MintButton and MintSuccessModal

**Files:**
- Create: `app/components/MintButton.tsx`
- Create: `app/components/MintSuccessModal.tsx`

**Interfaces:**
- Consumes: `useMint`, `useMintPrice`, `useTotalSupply`, `useMaxSupply`, `usePublicSaleActive`
- Produces: `MintButton` with quantity selector + transaction states, `MintSuccessModal` with NFT preview

- [ ] **Step 1: Create `MintSuccessModal.tsx`**

Create `app/components/MintSuccessModal.tsx`:

```tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { ipfsToHttps } from "@/lib/ipfs"
import type { NFTMetadata } from "@/lib/ipfs"

interface MintSuccessModalProps {
  open: boolean
  onClose: () => void
  tokenId: number | null
  metadata: NFTMetadata | null
  txHash: string | null
  explorerUrl: string
}

export function MintSuccessModal({
  open,
  onClose,
  tokenId,
  metadata,
  txHash,
  explorerUrl,
}: MintSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-2xl">Mint Successful!</DialogTitle>
          <DialogDescription>
            You now own Artistic Aura #{tokenId}
          </DialogDescription>
        </DialogHeader>

        {metadata && (
          <div className="flex flex-col items-center gap-4">
            <img
              src={ipfsToHttps(metadata.image)}
              alt={metadata.name}
              className="w-48 h-48 rounded-lg object-cover"
            />
            <p className="text-sm text-muted-foreground text-center">{metadata.name}</p>
          </div>
        )}

        {txHash && (
          <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full">
              View on Etherscan <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create `MintButton.tsx`**

Create `app/components/MintButton.tsx`:

```tsx
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MintSuccessModal } from "@/components/MintSuccessModal"
import { useMint } from "@/hooks/write/useMint"
import { useMintPrice } from "@/hooks/read/useMintPrice"
import { useTotalSupply } from "@/hooks/read/useTotalSupply"
import { useMaxSupply } from "@/hooks/read/useMaxSupply"
import { usePublicSaleActive } from "@/hooks/read/usePublicSaleActive"
import { useTokenURI } from "@/hooks/read/useTokenURI"
import { fetchMetadata, type NFTMetadata } from "@/lib/ipfs"
import { formatEther } from "viem"
import { sepolia } from "wagmi/chains"

export function MintButton() {
  const { address, chain } = useAccount()
  const chainId = chain?.id ?? sepolia.id

  const { data: mintPrice } = useMintPrice(chainId)
  const { data: totalSupply } = useTotalSupply(chainId)
  const { data: maxSupply } = useMaxSupply(chainId)
  const { data: saleActive } = usePublicSaleActive(chainId)

  const { mint, isPending, isConfirming, isConfirmed, txHash, receipt, error, reset } =
    useMint(chainId)

  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null)
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)

  const remaining = maxSupply && totalSupply ? Number(maxSupply) - Number(totalSupply) : 0
  const soldOut = remaining === 0
  const wrongNetwork = chain?.id !== undefined && chain.id !== chainId

  const cost = mintPrice ? formatEther(mintPrice * BigInt(quantity)) : "0"

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Transaction failed")
      reset()
    }
  }, [error, reset])

  useEffect(() => {
    if (isConfirmed && receipt) {
      const transferLog = receipt.logs.find(
        (log) => log.topics[0] ===
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
      )
      if (transferLog) {
        const tokenId = Number(BigInt(transferLog.topics[3]))
        setMintedTokenId(tokenId)
        setShowSuccess(true)
        toast.success("Mint successful!")
      }
    }
  }, [isConfirmed, receipt])

  useEffect(() => {
    if (mintedTokenId !== null) {
      const { refetch } = useTokenURI(chainId, mintedTokenId)
      refetch().then(({ data }) => {
        if (data) {
          fetchMetadata(data as string).then(setMetadata).catch(console.error)
        }
      })
    }
  }, [mintedTokenId, chainId])

  if (!address) {
    return <ConnectButton />
  }

  if (wrongNetwork) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Badge variant="destructive">Wrong Network</Badge>
        <p className="text-sm text-muted-foreground">
          Switch to {chainId === sepolia.id ? "Sepolia" : "Mainnet"} to mint
        </p>
        <ConnectButton />
      </div>
    )
  }

  if (!saleActive) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Badge variant="secondary">Sale Paused</Badge>
        <p className="text-sm text-muted-foreground">Public sale is not active</p>
      </div>
    )
  }

  if (soldOut) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Badge variant="destructive">Sold Out</Badge>
        <p className="text-sm text-muted-foreground">All 21 pieces have been minted</p>
      </div>
    )
  }

  const handleMint = async () => {
    if (!mintPrice) return
    try {
      await mint(quantity, mintPrice)
    } catch (e) {
      toast.error("Transaction cancelled")
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Quantity:</label>
          <Input
            type="number"
            min={1}
            max={remaining}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (val >= 1 && val <= remaining) setQuantity(val)
            }}
            className="w-20 text-center"
          />
        </div>

        <div className="text-lg">
          Total: <span className="font-bold text-gradient">{cost} ETH</span>
        </div>

        <Button
          size="lg"
          onClick={handleMint}
          disabled={isPending || isConfirming}
          className="gradient-accent text-white w-full"
        >
          {isPending
            ? "Confirm in wallet..."
            : isConfirming
              ? "Confirming..."
              : `Mint ${quantity} NFT${quantity > 1 ? "s" : ""}`}
        </Button>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="gradient-accent h-full transition-all"
            style={{
              width: `${totalSupply && maxSupply ? (Number(totalSupply) / Number(maxSupply)) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {totalSupply?.toString() ?? "0"} / {maxSupply?.toString() ?? "21"} minted
        </p>
      </div>

      <MintSuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          reset()
        }}
        tokenId={mintedTokenId}
        metadata={metadata}
        txHash={txHash}
        explorerUrl="https://sepolia.etherscan.io"
      />
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: add MintButton and MintSuccessModal components"
```

---

### Task 12: Create Mint page

**Files:**
- Create: `app/app/mint/page.tsx`

**Interfaces:**
- Consumes: `MintButton`, `motion` from Framer Motion
- Produces: Mint page at `/mint`

- [ ] **Step 1: Create `app/app/mint/page.tsx`**

Create `app/app/mint/page.tsx`:

```tsx
"use client"

import { motion } from "framer-motion"
import { MintButton } from "@/components/MintButton"

export default function MintPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-gradient text-center">
          Mint Your Aura
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Each Artistic Aura is a unique piece of cosmic expressionism.
          Mint yours for 0.04 ETH.
        </p>

        <div className="glass rounded-2xl p-8 w-full">
          <MintButton />
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build and dev**

```bash
cd app && npm run build
```

Expected: build succeeds.

```bash
cd app && npm run dev
```

Expected: `/mint` shows the mint page with quantity selector and mint button.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: add mint page"
```

---

### Task 13: Create NFTCard and NFTModal components

**Files:**
- Create: `app/components/NFTCard.tsx`
- Create: `app/components/NFTModal.tsx`

**Interfaces:**
- Consumes: `useTokenURI`, `useOwnerOf`, `fetchMetadata`, `ipfsToHttps`, `NFTMetadata`
- Produces: `NFTCard` for gallery grid, `NFTModal` for detail view

- [ ] **Step 1: Create `NFTModal.tsx`**

Create `app/components/NFTModal.tsx`:

```tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ipfsToHttps, type NFTMetadata } from "@/lib/ipfs"

interface NFTModalProps {
  open: boolean
  onClose: () => void
  tokenId: number
  metadata: NFTMetadata | null
  owner: string | null
}

export function NFTModal({ open, onClose, tokenId, metadata, owner }: NFTModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient text-2xl">
            {metadata?.name ?? `Artistic Aura #${tokenId}`}
          </DialogTitle>
          <DialogDescription>
            Token ID: {tokenId}
            {owner && ` • Owner: ${owner.slice(0, 6)}...${owner.slice(-4)}`}
          </DialogDescription>
        </DialogHeader>

        {metadata ? (
          <div className="grid md:grid-cols-2 gap-6">
            <img
              src={ipfsToHttps(metadata.image)}
              alt={metadata.name}
              className="w-full rounded-lg object-cover"
            />
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{metadata.description}</p>
              <div className="flex flex-wrap gap-2">
                {metadata.attributes.map((attr, i) => (
                  <Badge key={i} variant="secondary" className="flex flex-col items-start py-2">
                    <span className="text-xs text-muted-foreground">{attr.trait_type}</span>
                    <span className="text-sm">{String(attr.value)}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading metadata...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create `NFTCard.tsx`**

Create `app/components/NFTCard.tsx`:

```tsx
"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"
import { useTokenURI } from "@/hooks/read/useTokenURI"
import { useOwnerOf } from "@/hooks/read/useOwnerOf"
import { fetchMetadata, ipfsToHttps, type NFTMetadata } from "@/lib/ipfs"
import { NFTModal } from "@/components/NFTModal"
import { Badge } from "@/components/ui/badge"

interface NFTCardProps {
  tokenId: number
  index: number
}

export function NFTCard({ tokenId, index }: NFTCardProps) {
  const { chain } = useAccount()
  const chainId = chain?.id ?? 11155111

  const { data: tokenURI, isError: uriError } = useTokenURI(chainId, tokenId)
  const { data: owner, isError: ownerError } = useOwnerOf(chainId, tokenId)

  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const isMinted = !ownerError && !!owner

  useEffect(() => {
    if (tokenURI) {
      setLoading(true)
      fetchMetadata(tokenURI as string)
        .then(setMetadata)
        .catch(() => setMetadata(null))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [tokenURI])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -5 }}
        className="glass rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => isMinted && setShowModal(true)}
      >
        <div className="aspect-square relative overflow-hidden">
          {isMinted && metadata ? (
            <img
              src={ipfsToHttps(metadata.image)}
              alt={metadata.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">
                {loading ? "Loading..." : "Not minted"}
              </span>
            </div>
          )}
          {isMinted && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="glass">#{tokenId}</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="font-heading font-semibold text-sm truncate">
            {metadata?.name ?? `Aura #${tokenId}`}
          </p>
          {isMinted && metadata && (
            <div className="flex flex-wrap gap-1 mt-2">
              {metadata.attributes.slice(0, 2).map((attr, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {String(attr.value)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <NFTModal
        open={showModal}
        onClose={() => setShowModal(false)}
        tokenId={tokenId}
        metadata={metadata}
        owner={owner as string | null}
      />
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: add NFTCard and NFTModal components"
```

---

### Task 14: Create Gallery page

**Files:**
- Create: `app/app/gallery/page.tsx`

**Interfaces:**
- Consumes: `NFTCard`, `useMaxSupply`
- Produces: Gallery page at `/gallery` with 21-card grid and trait filter

- [ ] **Step 1: Create `app/app/gallery/page.tsx`**

Create `app/app/gallery/page.tsx`:

```tsx
"use client"

import { useState, useMemo } from "react"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"
import { NFTCard } from "@/components/NFTCard"
import { useMaxSupply } from "@/hooks/read/useMaxSupply"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function GalleryPage() {
  const { chain } = useAccount()
  const chainId = chain?.id ?? 11155111

  const { data: maxSupply } = useMaxSupply(chainId)
  const total = maxSupply ? Number(maxSupply) : 21

  const [filter, setFilter] = useState("")

  const tokenIds = useMemo(
    () => Array.from({ length: total }, (_, i) => i + 1),
    [total]
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-gradient text-center mb-4">
          Gallery
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Browse all {total} pieces in the collection
        </p>

        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name or trait..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tokenIds.map((tokenId, index) => (
            <NFTCard key={tokenId} tokenId={tokenId} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build and dev**

```bash
cd app && npm run build
```

Expected: build succeeds.

```bash
cd app && npm run dev
```

Expected: `/gallery` shows a grid of 21 cards. Minted tokens show images, unminted show "Not minted" placeholder.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: add gallery page with 21-card grid"
```

---

### Task 15: Final build verification and lint

**Files:**
- None (verification only)

- [ ] **Step 1: Run lint**

```bash
cd app && npm run lint
```

Expected: no errors. If there are warnings, fix them.

- [ ] **Step 2: Run build**

```bash
cd app && npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Run dev and manually verify all pages**

```bash
cd app && npm run dev
```

Manual checklist:
1. `http://localhost:3000` — landing page with aurora background, stats, CTAs
2. `http://localhost:3000/mint` — mint page with quantity selector
3. `http://localhost:3000/gallery` — gallery with 21 cards
4. Connect wallet button works
5. No console errors on any page

- [ ] **Step 4: Commit any lint fixes**

```bash
git add app/
git commit -m "fix: resolve lint warnings from final build"
```

(Only if there were fixes needed. Skip if clean.)

- [ ] **Step 5: Final commit with all changes**

```bash
git add app/
git commit -m "feat: complete Artistic Auras frontend"
```

---

## Self-Review Notes

**Spec coverage:**
- Landing page: Task 10 ✅
- Mint page: Tasks 11-12 ✅
- Gallery page: Tasks 13-14 ✅
- Contract reads: Task 6 ✅
- Contract writes: Task 7 ✅
- IPFS helpers: Task 4 ✅
- Providers: Task 5 ✅
- shadcn/ui: Task 3 ✅
- AuroraBackground: Task 8 ✅
- Header + StatsBar: Task 9 ✅
- Error handling: MintButton (Task 11) covers wallet/network/sale/sold-out states ✅
- No admin UI: confirmed — no admin page in plan ✅
- Build verification: Task 15 ✅

**Placeholder scan:** No TBDs, TODOs, or vague steps. All code blocks are complete.

**Type consistency:** `NFTMetadata` type defined in Task 4, used consistently in Tasks 11 and 13. `contractABI` and `getContractAddress` from Task 4 used consistently in Tasks 6-7. Hook signatures match across tasks.
