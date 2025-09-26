import { VaultHoldingType } from "@/types/vault-config.types";
import { useVaultMetricUnitStore } from "@/hooks";
import { WrapCard } from "./wrap-card";
import { FormatNumberByMetrics } from "./format-number-by-metrics";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

export const PnlBreakdown = ({ data }: { data: VaultHoldingType }) => {
  const { unit, key } = useVaultMetricUnitStore(data?.vault_id);

  const compoundedRewards = useMemo(
    () => Number(data?.[`user_total_rewards_${key}`] ?? 0),
    [data, key]
  );

  const impermanentLoss = useMemo(
    () => Number(data?.[`impermanent_loss_${key}`] ?? 0),
    [data, key]
  );

  const netPnl = useMemo(
    () => Number(data?.[`net_pnl_${key}`] ?? 0),
    [data, key]
  );

  return (
    <WrapCard className="px-6 py-5 rounded-2xl bg-[#111] space-y-4">
      <div className="font-sans text-lg font-semibold text-white/90">
        All Time P&L Breakdown
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <span>Compounded Rewards</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        <FormatNumberByMetrics
          unit={unit}
          number={compoundedRewards}
          className="font-mono text-sm font-semibold text-green-increase"
          collateralClassName="w-4 h-4"
          indicator
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Impermanent Loss</span>
        <FormatNumberByMetrics
          unit={unit}
          number={impermanentLoss}
          className="font-mono font-semibold text-red-error"
          collateralClassName="w-4 h-4"
          indicator
        />
      </div>

      <hr className="border-white/10" />

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">Net P&L</span>
        <FormatNumberByMetrics
          unit={unit}
          number={netPnl}
          className={`font-mono text-base font-semibold ${
            netPnl >= 0 ? "text-green-increase" : "text-red-error"
          }`}
          collateralClassName="w-4 h-4"
          indicator
        />
      </div>
    </WrapCard>
  );
};
