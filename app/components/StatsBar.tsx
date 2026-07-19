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
    { label: "Total Supply", value: String(totalSupply), valueClass: "text-on-surface" },
    { label: "Mint Price", value: mintPrice, valueClass: "text-primary" },
    { label: "Royalty", value: royalty, valueClass: "text-on-surface" },
  ] as const;

  return (
    <div className={`glass-panel mt-24 flex w-full max-w-3xl animate-fade-in-up delay-300 flex-col items-center justify-between gap-8 rounded-xl p-6 md:mt-32 md:flex-row md:gap-4 md:p-8 ${className}`}>
      {stats.map((stat, index) => (
        <div key={stat.label} className="contents">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 font-mono text-xs uppercase tracking-widest text-outline">
              {stat.label}
            </span>
            <span className={`font-heading text-[32px] ${stat.valueClass}`}>
              {stat.value}
            </span>
          </div>
          {index < stats.length - 1 && (
            <>
              <div className="hidden h-12 w-px bg-white/10 md:block" />
              <div className="h-px w-full bg-white/10 md:hidden" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
