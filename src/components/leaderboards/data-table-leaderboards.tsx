import { useState, useMemo } from "react";
import { useLeaderboard } from "@/hooks/use-leaderboards";
import { TabFilterTime, TabLeaderboard } from "@/types/leaderboards.types";
import useBreakpoint from "@/hooks/use-breakpoint";
import { useWallet } from "@/hooks";
import { showFormatNumber } from "@/lib/number";
import { truncateStringWithSeparator } from "@/utils/helpers";
import { USDC_CONFIG, XP_CONFIG, GEMS_CONFIG } from "@/config/coin-config";
import { LeaderboardItem, Columns } from "./helper";
import { LeaderboardsItemData } from "@/types/leaderboards.types.ts";

import ConditionRenderer from "@/components/shared/condition-renderer";
import { TableRender } from "@/components/ui/table-render";
import TimeLeaderboards from "./time-leaderboards";
import ItemMobileLeaderboards from "./item-mobile-leaderboards";
import NoDataLeaderboards from "./no-data-leaderboards";

interface DataTableLeaderboardsProps {
  tabLeaderboard: TabLeaderboard;
}

export default function DataTableLeaderboards({
  tabLeaderboard,
}: DataTableLeaderboardsProps) {
  const [tab, setTab] = useState<TabFilterTime>("this-week");
  const { data, isLoading } = useLeaderboard(tabLeaderboard, tab);
  const { isMd } = useBreakpoint();
  const { address } = useWallet();

  const mapData = useMemo(() => {
    return data?.list?.map((el: LeaderboardsItemData, idx) => {
      const rewardConfigs = [
        { value: el.reward_usdc, ...USDC_CONFIG },
        { value: el.reward_xp_shares, ...XP_CONFIG },
        { value: el.reward_gems, ...GEMS_CONFIG },
      ];

      const rewards = rewardConfigs
        .filter((r) => Number(r.value) > 0)
        .map((r) => ({
          image: r.image_url,
          symbol: r.symbol,
          value: showFormatNumber(r.value),
        }));

      return {
        rank: idx + 1,
        wallet_address: truncateStringWithSeparator(
          el.user_wallet,
          13,
          "...",
          6
        ),
        tvl: showFormatNumber(el?.tvl_usd || el?.ref_tvl_usd || 0, 2, 2, "$"),
        rewards,
        isYou: address?.toLowerCase() === el.user_wallet?.toLowerCase(),
      };
    }) as LeaderboardItem[];
  }, [data, address]);

  // RENDER
  return (
    <>
      <TimeLeaderboards
        tab={tab}
        setTab={setTab}
        timeFrom={data?.isoDatetimeFrom}
        timeTo={data?.isoDatetimeTo}
        timeLastUpdate={data?.lastUpdate}
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
                  tabLeaderboard={tabLeaderboard}
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
            <TableRender
              headerClassName="p-4 h-[70px] border-b"
              data={mapData}
              columns={Columns(tabLeaderboard)}
              isLoading={isLoading}
              classRowBody="even:bg-[#212121]"
            />
          </div>
        </ConditionRenderer>
      </ConditionRenderer>
    </>
  );
}
