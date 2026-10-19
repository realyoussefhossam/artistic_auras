import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Render the mark in white (for dark/grey surfaces). */
  inverted?: boolean;
  priority?: boolean;
  className?: string;
  markClassName?: string;
  nameClassName?: string;
}

/**
 * Artist lockup: capsule monogram mark with "Valerio Lorenzo" underneath.
 * Mark is derived from the supplied artwork (black line art, transparent bg),
 * resized to 512px tall for retina displays.
 */
export function BrandLogo({
  inverted = false,
  priority = false,
  className,
  markClassName,
  nameClassName,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Valerio Lorenzo — home"
      className={cn(
        "inline-flex flex-col items-center gap-1 transition-opacity hover:opacity-80",
        className
      )}
    >
      <Image
        src="/brand/valerio-lorenzo-mark.png"
        alt=""
        width={287}
        height={512}
        priority={priority}
        className={cn("w-auto", inverted && "invert", markClassName)}
      />
      <span
        className={cn(
          "font-heading font-medium leading-none whitespace-nowrap",
          nameClassName
        )}
      >
        Valerio Lorenzo
      </span>
    </Link>
  );
}
