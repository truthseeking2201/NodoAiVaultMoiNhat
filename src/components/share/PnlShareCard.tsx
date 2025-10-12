import { forwardRef, useMemo } from "react";
import clsx from "clsx";
import type { PnlCardPayload } from "@/types/share";

const getSparklinePath = (values: number[], height: number, width: number) => {
  if (!values.length) {
    return "";
  }
  const clamped = values.map((value) => {
    if (Number.isFinite(value)) {
      return Math.min(1, Math.max(0, value));
    }
    return 0;
  });
  const step = width / Math.max(1, clamped.length - 1);
  return clamped
    .map((value, index) => {
      const x = index * step;
      const y = height - value * height;
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
};

const getSparklineArea = (values: number[], height: number, width: number) => {
  if (!values.length) {
    return "";
  }
  const path = getSparklinePath(values, height, width);
  if (!path) return "";
  const lastX = width;
  return `${path} L${lastX} ${height} L0 ${height} Z`;
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0.0%";
  }
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  return `${sign}${abs.toFixed(1)}%`;
};

const formatUsd = (value: number) => {
  if (!Number.isFinite(value)) {
    return "$0.00";
  }
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}$${abs.toLocaleString(undefined, {
    minimumFractionDigits: abs >= 100 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

type SparklineProps = {
  values: number[];
  positive: boolean;
};

const Sparkline = ({ values, positive }: SparklineProps) => {
  const width = 520;
  const height = 280;
  const path = useMemo(
    () => getSparklinePath(values, height, width),
    [values, height, width]
  );
  const area = useMemo(
    () => getSparklineArea(values, height, width),
    [values, height, width]
  );
  const lastValue = values[values.length - 1] ?? 0.5;
  const lastX = values.length > 1 ? width : 0;
  const lastY = height - Math.min(1, Math.max(0, lastValue)) * height;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pnl-sparkline-gradient"
          x1="0%"
          x2="0%"
          y1="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor={positive ? "rgba(34,197,94,0.35)" : "rgba(248,113,113,0.35)"}
          />
          <stop offset="100%" stopColor="rgba(17,17,20,0)" />
        </linearGradient>
      </defs>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#pnl-sparkline-gradient)"
        opacity={0.2}
      />
      {area && (
        <path
          d={area}
          fill="url(#pnl-sparkline-gradient)"
          stroke="none"
          opacity={0.7}
        />
      )}
      {path && (
        <path
          d={path}
          fill="none"
          stroke={positive ? "#22c55e" : "#f87171"}
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
      {path && (
        <circle
          cx={lastX}
          cy={lastY}
          r={10}
          fill="#111217"
          stroke={positive ? "#22c55e" : "#f87171"}
          strokeWidth={6}
        />
      )}
    </svg>
  );
};

type PnlShareCardProps = {
  data: PnlCardPayload;
  className?: string;
};

export const PnlShareCard = forwardRef<HTMLDivElement, PnlShareCardProps>(
  ({ data, className }, ref) => {
    const positive = data.pnlPercent >= 0;
    const tag = `PnL (${data.period})`;
    const percent = formatPercent(data.pnlPercent);
    const usd =
      data.hideAmounts === true ? null : formatUsd(data.pnlUsd);

    const displaySparkline = data.sparkline.length
      ? data.sparkline
      : Array.from({ length: 24 }, (_, index, arr) => {
          const t = index / Math.max(1, arr.length - 1);
          const curve = positive ? t ** 1.5 : 1 - (1 - t) ** 1.5;
          const noise = (Math.sin(index * 0.9) + 1) / 12;
          return Math.max(0.05, Math.min(0.95, curve + (positive ? noise : -noise)));
        });

    return (
      <div
        ref={ref}
        className={clsx(
          "flex h-[675px] w-[1200px] flex-col rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(94,234,212,0.12),rgba(12,15,24,0.9))] p-10 text-white shadow-[0_45px_120px_rgba(1,8,21,0.45)]",
          "font-sans",
          className
        )}
        style={{ backgroundColor: "#0e1014" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand/nodo-mark.svg"
              alt="NODO logo"
              className="h-14 w-14 rounded-xl border border-white/15 bg-white/5 p-3"
            />
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
                nodo ai vaults
              </div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {data.vaultName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {data.vaultSymbols?.length ? (
              <div className="flex -space-x-3">
                {data.vaultSymbols.slice(0, 3).map((symbol) => (
                  <div
                    key={symbol}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold uppercase"
                  >
                    <span>{symbol.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
              {tag}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-1 gap-10">
          <div className="flex w-[520px] flex-col justify-between">
            <div>
              <div className="text-base font-medium text-white/60">
                Performance Summary
              </div>
              <div
                className={clsx(
                  "mt-4 text-[112px] font-bold leading-[0.85] tabular-nums",
                  positive ? "text-emerald-300" : "text-red-400"
                )}
              >
                {percent.replace("−", "−")}
              </div>
              {usd && (
                <div className="mt-5 text-4xl font-semibold text-white/85 tabular-nums">
                  {usd}
                </div>
              )}
            </div>

            <div className="space-y-4 text-sm text-white/60">
              <div className="font-mono uppercase tracking-[0.28em] text-white/45">
                Wallet
              </div>
              <div className="text-xl font-semibold text-white">
                {data.walletMasked}
              </div>

              <div className="font-mono uppercase tracking-[0.28em] text-white/45">
                Updated
              </div>
              <div className="text-sm text-white/70">
                {new Date(data.timestampISO).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/45">
                pnl trajectory
              </div>
              <div className="text-xs text-white/50">
                Normalized performance • {positive ? "Uptrend" : "Drawdown"}
              </div>
            </div>
            <div className="mt-6 h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#10131a]">
              <Sparkline values={displaySparkline} positive={positive} />
            </div>
            <div className="mt-auto text-xs text-white/45">
              Past performance is not indicative of future results.
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between text-xs text-white/45">
          <span>nodo.ai • DeFi vault intelligence • Not financial advice</span>
          <span>Share your progress • Stay diversified • #NODO #DeFi</span>
        </div>
      </div>
    );
  }
);

PnlShareCard.displayName = "PnlShareCard";
