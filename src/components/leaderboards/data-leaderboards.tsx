import { useState } from "react";
import { TabsLeaderboards } from "./tabs-leaderboards";
import DataTableLeaderboards from "./data-table-leaderboards";
import ConditionRenderer from "@/components/shared/condition-renderer";

export default function DataLeaderboards() {
  const [tab, setTab] = useState<string>("tvl");

  // RENDER
  return (
    <div className="">
      <TabsLeaderboards tab={tab} setTab={setTab} />
      <div className="md:bg-[#1C1C1C] max-md:bg-[#121212] rounded-b-md md:rounded-b-xl">
        <ConditionRenderer when={tab === "tvl"}>
          <DataTableLeaderboards />
        </ConditionRenderer>
        <ConditionRenderer when={tab === "refer"}>
          <DataTableLeaderboards isReferTvl={true} />
        </ConditionRenderer>
      </div>
    </div>
  );
}
