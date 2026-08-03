"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Landing", href: "/" },
  { label: "Mint", href: "/mint" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="header-bar fixed top-0 z-50 w-full">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-2xl font-black tracking-tight text-on-header transition-opacity hover:opacity-80"
        >
          <Sparkles className="size-6" />
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
                      ? "border-b-2 border-on-header pb-1 text-on-header"
                      : "text-on-header/80 transition-colors hover:text-on-header"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
