import { useMemo } from "react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

type Props = {
  holdUsd: number;
  lpUsd: number;
};

export default function HoldVsLP({ holdUsd, lpUsd }: Props) {
  const { delta, tone } = useMemo(() => {
    const diff = lpUsd - holdUsd;
    return {
      delta: diff,
      tone: diff === 0 ? "text-white" : diff > 0 ? "text-green-increase" : "text-red-400",
    };
  }, [holdUsd, lpUsd]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between text-sm text-white/70">
          <span>Holding Tokens</span>
          <span className="font-mono text-white">{formatCurrency(holdUsd)}</span>
        </div>
        <div className="flex flex-wrap justify-between text-sm text-white/70">
          <span>Providing Liquidity</span>
          <span className="font-mono text-white">{formatCurrency(lpUsd)}</span>
        </div>
        <div className="flex flex-wrap justify-between text-sm font-semibold">
          <span>Difference</span>
          <span className={`font-mono ${tone}`}>{formatCurrency(delta)}</span>
        </div>
      </div>
    </div>
  );
}
