import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/30 relative z-10 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-5 md:px-16 gap-6 max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-heading text-2xl font-bold text-on-surface">
            Artistic Auras
          </div>
          <p className="font-mono text-xs text-secondary">
            © 2026 Artistic Auras. All rights reserved.
          </p>
        </div>
        <ul className="flex flex-wrap justify-center gap-6 font-mono text-xs text-on-surface-variant items-center">
          <li>
            <a
              className="hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
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
              className="hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/icons/telegram.svg" alt="Telegram" width={16} height={16} />
              Telegram
            </a>
          </li>
          <li>
            <a className="hover:text-primary transition-colors duration-200" href="#">
              Etherscan
            </a>
          </li>
          <li>
            <span className="text-outline-variant flex items-center gap-1.5">
              <Image src="/icons/ethereum.svg" alt="Ethereum" width={16} height={16} />
              Built on Ethereum
            </span>
          </li>
        </ul>
      </div>
    </footer>
  );
}
