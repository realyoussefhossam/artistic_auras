"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Landing", href: "/" },
  { label: "Mint", href: "/mint" },
  { label: "Gallery", href: "/gallery" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-surface/70 shadow-[0_0_20px_rgba(124,58,237,0.1)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-[32px] font-bold tracking-tight text-on-surface transition-colors hover:text-primary"
        >
          <Sparkles className="text-primary" />
          Artistic Auras
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    isActive
                      ? "border-b-2 border-primary pb-1 text-primary"
                      : "text-on-surface-variant transition-colors hover:text-on-surface"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <ConnectButton />
      </div>
    </nav>
  );
}
