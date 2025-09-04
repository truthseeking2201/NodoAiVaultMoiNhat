import { useState, useMemo } from "react";
import { useLeaderboard } from "@/hooks/use-leaderboards";
import useBreakpoint from "@/hooks/use-breakpoint";
import { showFormatNumber } from "@/lib/number";
import { truncateStringWithSeparator } from "@/utils/helpers";
import { USDC_CONFIG, XP_CONFIG } from "@/config/coin-config";
import { LeaderboardItem, Columns } from "./helper";

import ConditionRenderer from "@/components/shared/condition-renderer";
import { TableRender } from "@/components/ui/table-render";
import TimeLeaderboards from "./time-leaderboards";
import ItemMobileLeaderboards from "./item-mobile-leaderboards";
import NoDataLeaderboards from "./no-data-leaderboards";

interface DataTableLeaderboardsProps {
  isReferTvl?: boolean;
}

export default function DataTableLeaderboards({
  isReferTvl = false,
}: DataTableLeaderboardsProps) {
  const [tab, setTab] = useState<string>("this-week");
  const { data, isLoading } = useLeaderboard(isReferTvl);
  const { isMd } = useBreakpoint();

  const mapData = useMemo(() => {
    // return [];
    // TODO
    return data?.map((el: any, idx) => {
      const rewards = [];
      if (idx < 10) {
        rewards.push({
          image: USDC_CONFIG.image_url,
          symbol: USDC_CONFIG.symbol,
          value: showFormatNumber(el.vault_cap / 100),
        });
      }
      rewards.push({
        image: XP_CONFIG.image_url,
        symbol: XP_CONFIG.symbol,
        value: showFormatNumber(el.vault_cap),
      });

      return {
        rank: idx + 1,
        wallet_address: truncateStringWithSeparator(
          el.vault_address,
          13,
          "...",
          6
        ),
        tvl: showFormatNumber(el.total_value_usd || 0, 2, 2, "$"),
        rewards,
      };
    }) as LeaderboardItem[];
  }, [data]);

  // RENDER
  return (
    <>
      <TimeLeaderboards
        tab={tab}
        setTab={setTab}
        timeFrom="2025-07-18T08:14:34.629Z"
        timeTo="2025-07-18T08:14:34.629Z"
        timeLastUpdate="2025-07-18T08:14:34.629Z"
        isLoading={isLoading}
      />

      <ConditionRenderer
        when={isMd}
        fallback={
          <div className="px-3 pb-3 pt-1">
            <ConditionRenderer
              when={mapData?.length > 0}
              fallback={
                <ConditionRenderer
                  when={isLoading}
                  fallback={<NoDataLeaderboards />}
                >
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[270px] bg-white/10 animate-pulse rounded w-full"
                      />
                    ))}
                  </div>
                </ConditionRenderer>
              }
            >
              {mapData?.map((item) => (
                <ItemMobileLeaderboards
                  key={item.rank}
                  item={item}
                  isReferTvl={isReferTvl}
                />
              ))}
            </ConditionRenderer>
          </div>
        }
      >
        <ConditionRenderer
          when={isLoading || mapData?.length > 0}
          fallback={<NoDataLeaderboards />}
        >
          <div className="rounded-b-md md:rounded-b-xl overflow-hidden border border-t-0 rounded-t-none border-white/10">
            {/* TableRender */}
            <TableRender
              headerClassName="p-4 h-[70px] border-b"
              data={mapData}
              columns={Columns(isReferTvl)}
              isLoading={isLoading}
            />
          </div>
        </ConditionRenderer>
      </ConditionRenderer>
    </>
  );
}
