import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "tvl", label: "TVL Leaderboard" },
  { value: "refer", label: "Referred TVL Leaderboard" },
];

export const TabsLeaderboards = ({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (tab: string) => void;
}) => {
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value)}>
      <TabsList className="flex gap-1 relative z-10 w-full p-0 bg-black/50 rounded-b-none rounded-t-md md:rounded-t-xl overflow-hidden !border-none">
        {TABS.map((t) => {
          const isActive = tab === t.value;
          return (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="w-full h-[32px] md:h-[60px] !rounded-none bg-transparent transition-all duration-500"
              style={
                isActive
                  ? {
                      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                      background:
                        "linear-gradient(90deg, #FFE2C4 0%, #E8F3FF 100%)",
                    }
                  : {}
              }
            >
              <span
                className={cn(
                  "font-sans text-xs md:text-[22px] font-bold flex items-center",
                  {
                    "text-ai-dark  ": isActive,
                    "text-white/50 hover:text-white/65": !isActive,
                  }
                )}
              >
                {t.label}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
