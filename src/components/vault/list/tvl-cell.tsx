import clsx from "clsx";

export function formatUSDShort(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatUSD(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

type TVLCellProps = {
  tvlUsd: number;
  capUsd?: number | null;
  tokenIconUrl?: string;
  tokenSymbol?: string;
  className?: string;
};

export function TVLCell({
  tvlUsd,
  capUsd,
  tokenIconUrl,
  tokenSymbol,
  className,
}: TVLCellProps) {
  const hasCap = typeof capUsd === "number" && capUsd > 0;
  const utilisation = hasCap ? Math.min(1, Math.max(0, tvlUsd / capUsd)) : null;

  let status: "full" | "almost" | undefined;
  if (utilisation !== null && utilisation >= 1) status = "full";
  else if (utilisation !== null && utilisation >= 0.9) status = "almost";

  return (
    <div className={clsx("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {tokenIconUrl ? (
            <img
              src={tokenIconUrl}
              alt={tokenSymbol ?? "Token"}
              className="h-4 w-4 shrink-0 rounded-full"
              loading="lazy"
            />
          ) : null}
          {tokenSymbol ? (
            <span className="text-xs uppercase tracking-wide text-white/60">
              {tokenSymbol}
            </span>
          ) : null}
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-medium text-white/90 tabular-nums md:text-[15px]">
              {formatUSDShort(tvlUsd)}
            </span>
            {hasCap ? (
              <span className="text-xs text-white/55 tabular-nums">
                ({formatUSDShort(capUsd as number)})
              </span>
            ) : null}
          </div>
        </div>
        {hasCap ? (
          <div className="mt-1 h-2 rounded-full border border-white/10 bg-white/8">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                status === "full"
                  ? "bg-red-400/80"
                  : status === "almost"
                  ? "bg-amber-400/80"
                  : "bg-white/30"
              )}
              style={{ width: `${(utilisation as number) * 100}%` }}
              role="progressbar"
              aria-valuenow={Math.round((utilisation as number) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              title={`${formatUSD(tvlUsd)} / ${formatUSD(
                capUsd as number
              )} (${Math.round((utilisation as number) * 100)}%)`}
            />
          </div>
        ) : (
          <div className="mt-1 h-2 rounded-full border border-white/10 bg-white/5 opacity-40" />
        )}
      </div>
      {status ? (
        <span
          className={clsx(
            "shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
            status === "full"
              ? "border-red-400/30 bg-red-500/10 text-red-300"
              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          )}
        >
          {status === "full" ? "Full" : "Almost Full"}
        </span>
      ) : null}
    </div>
  );
}

