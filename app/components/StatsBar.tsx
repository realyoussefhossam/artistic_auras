"use client";

type StatsBarProps = {
  totalSupply?: number;
  mintPrice?: string;
  royalty?: string;
  className?: string;
};

export function StatsBar({
  totalSupply = 21,
  mintPrice = "0.04 ETH",
  royalty = "5%",
  className = "",
}: StatsBarProps) {
  const stats = [
    { label: "Total Supply", value: String(totalSupply) },
    { label: "Minted", value: String(totalSupply) },
    { label: "Mint Price", value: mintPrice },
    { label: "Royalty", value: royalty },
  ] as const;

  return (
    <div
      className={`card flex w-full max-w-3xl animate-fade-in-up delay-300 flex-col items-center justify-between gap-6 rounded-lg p-6 md:flex-row md:gap-4 md:p-8 ${className}`}
    >
      {stats.map((stat, index) => (
        <div key={stat.label} className="contents">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 text-xs uppercase tracking-widest text-muted">
              {stat.label}
            </span>
            <span className="font-heading text-2xl font-black text-primary">
              {stat.value}
            </span>
          </div>
          {index < stats.length - 1 && (
            <div className="hidden h-10 w-px bg-border-default md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
