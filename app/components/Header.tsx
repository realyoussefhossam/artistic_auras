"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/BrandLogo";

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
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-2 md:px-16">
        <BrandLogo
          inverted
          priority
          markClassName="h-10"
          nameClassName="text-[11px] tracking-[0.06em] text-on-header"
          className="text-on-header"
        />

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
