import { useState } from "react";
import { TabsLeaderboards } from "./tabs-leaderboards";
import { TabLeaderboard } from "@/types/leaderboards.types";
import DataTableLeaderboards from "./data-table-leaderboards";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { LEADERBOARD_TYPE } from "@/config/constants-types.ts";

export default function DataLeaderboards() {
  const [tab, setTab] = useState<TabLeaderboard>(LEADERBOARD_TYPE.tvl);

  // RENDER
  return (
    <div className="">
      <TabsLeaderboards tab={tab} setTab={setTab} />
      <div className="md:bg-[#1C1C1C] max-md:bg-[#121212] rounded-b-md md:rounded-b-xl">
        <ConditionRenderer when={tab === LEADERBOARD_TYPE.tvl}>
          <DataTableLeaderboards tabLeaderboard={tab} />
        </ConditionRenderer>
        <ConditionRenderer when={tab === LEADERBOARD_TYPE.referred}>
          <DataTableLeaderboards tabLeaderboard={tab} />
        </ConditionRenderer>
      </div>
    </div>
  );
}
