import { VaultHoldingType } from "@/types/vault-config.types";
import { WrapCard } from "./wrap-card";
import { FormatNumberByMetrics } from "./format-number-by-metrics";
import { useMemo } from "react";
import { showFormatNumberOption } from "@/lib/number";
import { getImage } from "@/lib/utils";
import { RowItem } from "@/components/ui/row-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight } from "lucide-react";

export const PnlBreakdown = ({
  data,
  unitMetric,
  keyMetric,
}: {
  data: VaultHoldingType;
  unitMetric: string;
  keyMetric: string;
}) => {
  const totalRewards = useMemo(() => {
    return Number(data?.[`user_total_rewards_${keyMetric}`] || 0);
  }, [data, keyMetric]);

  const impermanentLoss = useMemo(() => {
    // TODO
    return data?.[`ndlp_price_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const netPNL = useMemo(() => {
    // TODO
    return unitMetric == "USD" ? 12 : -0.0000001;
  }, [unitMetric]);

  const valueClass =
    "font-mono text-white md:text-sm text-[13px] font-semibold";
  const labelClass = "text-[#C0C0C0] text-sm font-light";
  const collateralClass = "md:w-4 md:h-4 w-3.5 h-3.5";

  return (
    <WrapCard className="md:px-6 md:py-4 px-4 py-3">
      <div className="font-sans text-sm md:text-lg text-white/90 font-bold md:mb-4 mb-2">
        All Time P&L Breakdown
      </div>
      <RowItem>
        <RowItem.Label>
          <div className="flex items-center justify-between gap-2">
            <div className={labelClass}>Compounded Rewards</div>
            {totalRewards > 0 && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="rounded-full w-5 h-5 flex items-center justify-center bg-black/40 border border-white/30">
                      <ChevronRight className="h:4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="bg-black/90 rounded-xl shadow-lg p-4 min-w-[220px] z-50 border border-[#23272F]"
                  >
                    <div className="text-white/80 text-sm font-semibold mb-2">
                      Rewards Breakdown
                    </div>
                    <hr className="mx-[-16px] my-2" />
                    {data?.user_vault_rewards?.map((reward: any, idx) => (
                      <div
                        key={reward.token}
                        className="flex items-center gap-2 mb-1"
                      >
                        <img
                          src={getImage(reward.token_symbol)}
                          className="w-5 h-5 inline-flex items-center"
                        />
                        <span className="font-mono text-white text-xs">
                          {showFormatNumberOption(reward.amount, 3)}{" "}
                          {reward.token_symbol}
                        </span>
                        {reward.amount_in_usd > 0 && (
                          <span className="text-white/40 text-xs">
                            ~ ${showFormatNumberOption(reward.amount_in_usd)}
                          </span>
                        )}
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </RowItem.Label>
        <RowItem.Value>
          {totalRewards > 0 ? (
            <FormatNumberByMetrics
              unit={unitMetric}
              number={totalRewards}
              className={valueClass}
              collateralClassName={collateralClass}
              indicator
            />
          ) : (
            <div className="text-[#00FFB2] text-sm">
              <span className="font-medium">Farming</span>
              <span className="animate-fade-in-out inline-block delay-100">
                .
              </span>
              <span className="animate-fade-in-out inline-block delay-200">
                .
              </span>
              <span className="animate-fade-in-out inline-block delay-300">
                .
              </span>
            </div>
          )}
        </RowItem.Value>
      </RowItem>

      <RowItem
        className="md:mt-3 mt-1"
        label="Impermanent Loss"
        classNameLabel={labelClass}
      >
        <FormatNumberByMetrics
          unit={unitMetric}
          number={impermanentLoss}
          className={valueClass}
          collateralClassName={collateralClass}
          indicator
        />
      </RowItem>

      <hr className="w-full border-t border-white/15 mt-3 mb-3" />

      <RowItem label="Net P&L" classNameLabel="text-white text-base font-bold">
        <FormatNumberByMetrics
          unit={unitMetric}
          number={netPNL}
          className="md:text-lg text-[15px]"
          collateralClassName={collateralClass}
          indicator
        />
      </RowItem>
    </WrapCard>
  );
};
