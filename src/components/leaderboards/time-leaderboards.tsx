import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/utils/date";
import { TabFilterTime } from "@/types/leaderboards.types";

const TABS = [
  { value: "this-week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
];

type Props = {
  tab: string;
  setTab: (tab: TabFilterTime) => void;
  timeFrom: string;
  timeTo: string;
  timeLastUpdate: string;
  isLoading: boolean;
};

const TimeLeaderboards = ({
  tab,
  setTab,
  timeFrom,
  timeTo,
  timeLastUpdate,
  isLoading = false,
}: Props) => {
  return (
    <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3 md:flex-row-reverse px-6 py-4 max-md:p-3">
      {isLoading ? (
        <Skeleton className="w-[200px] h-5" />
      ) : (
        <div className="flex items-center text-sm gap-4 max-md:flex-col max-md:items-start max-md:gap-2 max-md:text-[13px]">
          {timeFrom && timeTo && (
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4  md:h-5 md:w-5 mr-2" />
              <span className="font-mono text-white">
                {formatDate(timeFrom, "dd MMM")} -{" "}
                {formatDate(timeTo, "dd MMM")}
              </span>
            </div>
          )}
          {timeLastUpdate && (
            <div>
              <span className="font-sans text-white/50">Last Update: </span>
              <span className="font-mono text-white">
                {formatDate(timeLastUpdate, "hh:mm dd/MM/yyyy")}
              </span>
            </div>
          )}
        </div>
      )}
      <Tabs
        value={tab}
        onValueChange={(value: TabFilterTime) => setTab(value)}
        className="max-md:w-full"
      >
        <TabsList className="p-1 flex gap-1 max-md:w-full">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="max-md:w-full"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TimeLeaderboards;
