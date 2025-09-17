import { VaultHoldingType } from "@/types/vault-config.types";
import { WrapCard } from "./wrap-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";
import { showFormatNumber, showFormatNumberOption } from "@/lib/number";
import { formatDate } from "@/utils/date";
import { getImage } from "@/lib/utils";
import useBreakpoint from "@/hooks/use-breakpoint";

const COLORS = [
  "#52BDE1",
  "#CC98FF",
  "#52E1A5",
  "#FFEC98",
  "#5254E1",
  "#B94E50",
  "#FFFFFF",
  "#98C3FF",
];

const ItemPending = ({ token_symbol }: { token_symbol: string }) => {
  return (
    <div className="flex items-center gap-2 bg-black px-4 py-2 mt-3 first:mt-0 rounded-md">
      <img
        src={getImage(token_symbol)}
        className="w-[20px] h-[20px] flex-shrink-0"
      />
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-[#6AD6FF] text-xs">
              Calculating
              <span className="animate-fade-in-out inline-block font-mono">
                .
              </span>
              <span className="animate-fade-in-out inline-block delay-100 font-mono">
                .
              </span>
              <span className="animate-fade-in-out inline-block delay-200 font-mono">
                .
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="bg-black/90 rounded-xl shadow-lg p-4 w-[350px] z-50 border border-[#23272F]"
          >
            <span className="text-white/80 text-xs">
              Your deposit has been received and is queued for the next{" "}
              <span className="font-bold">"Add liquidity"</span> cycle. Please
              wait for the next vault transaction
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const ItemAmount = ({ item, color }: { item: any; color: string }) => {
  return (
    <div className="flex items-center md:gap-3 gap-2 bg-black px-4 py-2 mt-3 first:mt-0 rounded-xl">
      <div className="rounded-full w-3 h-3" style={{ background: color }} />
      <img
        src={getImage(item.token_symbol)}
        className="w-[20px] h-[20px] flex-shrink-0"
      />
      <div className="flex-1 text-white text-sm font-medium">
        {showFormatNumberOption(item.amount)} <br className="sm:hidden block" />
        {item.token_symbol}
      </div>
      <div>
        <p className="m-0 font-mono text-sm text-white text-right">
          {showFormatNumber(item.value * 100, 0, 2)}%
        </p>
        <p className="m-0 font-mono text-xs text-white/60 text-right">
          {showFormatNumberOption(item.amount_in_usd, 2, 6, "$")}
        </p>
      </div>
    </div>
  );
};

export const EstLPBreakdown = ({ data }: { data: VaultHoldingType }) => {
  const { isMobile } = useBreakpoint();

  const infoChart = useMemo(() => {
    const size = isMobile ? 130 : 120;
    const ratio = 1;
    const thickness = 4;
    const maxRadius = (size / 2) * ratio;
    const outerRadius = maxRadius;
    const innerRadius = Math.max(outerRadius - thickness, 0);
    return { innerRadius, outerRadius, size };
  }, [isMobile]);

  const time = useMemo(() => {
    if (data?.timestamp) {
      return formatDate(data?.timestamp, "hh:mm:ss");
    }
    return "";
  }, [data]);

  const totalAmountInUsd = useMemo(() => {
    return data?.user_vault_tokens?.reduce(
      (sum, item) =>
        "amount_in_usd" in item && typeof item.amount_in_usd === "number"
          ? sum + item.amount_in_usd
          : sum,
      0
    );
  }, [data?.user_vault_tokens]);

  const pieData = useMemo(() => {
    return (
      data?.user_vault_tokens
        ?.slice()
        .sort(
          (a, b) => Number(b.amount_in_usd ?? 0) - Number(a.amount_in_usd ?? 0)
        )
        .map((item) => {
          return {
            amount: item?.amount || 0,
            amount_in_usd: item?.amount_in_usd || 0,
            token_name: item?.token_name || "",
            name: item?.token_name,
            token_symbol: item?.token_symbol,
            value: Number(item?.amount_in_usd) / totalAmountInUsd,
          };
        }) || []
    );
  }, [data?.user_vault_tokens, totalAmountInUsd]);

  return (
    <WrapCard className="md:p-5 px-4 py-3">
      <div className="font-sans text-sm md:text-lg text-white/90 font-bold mb-0.5">
        Estimated LP Breakdown
      </div>
      <p className="text-xs text-white/60 m-0">
        Secure updates ~1h
        {time && (
          <>
            <span className="mx-2">•</span>Updated {time}
          </>
        )}
      </p>
      <div className="mt-4">
        {totalAmountInUsd > 0 ? (
          <div className="flex max-md:flex-col md:flex-row-reverse items-center justify-between gap-6">
            <div className="flex items-center justify-center">
              <PieChart
                width={infoChart.size}
                height={infoChart.size}
                tabIndex={-1}
                className="cursor-not-allowed pointer-events-none select-none"
              >
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={infoChart.innerRadius}
                  outerRadius={infoChart.outerRadius}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={0}
                  endAngle={900}
                  paddingAngle={3}
                  cornerRadius={20}
                >
                  {pieData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="none"
                      pointerEvents="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="flex-1 max-md:w-full">
              {pieData?.map((el, idx) => (
                <ItemAmount
                  key={idx}
                  item={el}
                  color={COLORS[idx % COLORS.length]}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {data?.user_vault_tokens?.map((el, idx) => (
              <ItemPending key={idx} token_symbol={el.token_symbol} />
            ))}
          </>
        )}
      </div>
    </WrapCard>
  );
};
