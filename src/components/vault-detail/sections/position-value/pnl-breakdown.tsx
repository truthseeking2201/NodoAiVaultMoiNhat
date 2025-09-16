import { VaultHoldingType } from "@/types/vault-config.types";
import { WrapCard } from "./wrap-card";
import { FormatNumberByMetrics } from "./format-number-by-metrics";
import { useMemo, ReactNode } from "react";
import { showFormatNumber } from "@/lib/number";

export const PnlBreakdown = ({
  data,
  unitMetric,
  keyMetric,
}: {
  data: VaultHoldingType;
  unitMetric: string;
  keyMetric: string;
}) => {
  const reward24h = useMemo(() => {
    return data?.[`user_rewards_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const breakEvent = useMemo(() => {
    return data?.[`user_break_event_price_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const lpPrice = useMemo(() => {
    return data?.[`ndlp_price_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const sharesPercent = useMemo(() => {
    return Number(data?.user_shares_percent || 0) * 100;
  }, [data]);

  const valueClass = "font-mono text-white text-lg md:text-xl font-medium";
  const collateralClass = "w-4 h-4";

  return (
    <WrapCard className="md:px-6 md:py-4 px-4 py-3">
      <div className="font-sans text-sm md:text-lg text-white/90 font-bold mb-0.5">
        All Time P&L Breakdown
      </div>
    </WrapCard>
  );
};
