import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border-default bg-surface py-12">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-5 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="font-heading text-2xl font-black text-primary">
            Artistic Auras
          </div>
          <p className="text-xs text-muted">
            © 2026 Artistic Auras. All rights reserved.
          </p>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-6 text-xs text-secondary">
          <li>
            <a
              className="flex items-center gap-1.5 transition-colors hover:text-accent"
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/icons/x.svg" alt="X" width={16} height={16} />
              X
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-1.5 transition-colors hover:text-accent"
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/icons/telegram.svg" alt="Telegram" width={16} height={16} />
              Telegram
            </a>
          </li>
          <li>
            <a className="transition-colors hover:text-accent" href="#">
              Etherscan
            </a>
          </li>
          <li>
            <span className="flex items-center gap-1.5 text-muted">
              <Image src="/icons/ethereum.svg" alt="Ethereum" width={16} height={16} />
              Built on Ethereum
            </span>
          </li>
        </ul>
      </div>
    </footer>
  );
}
