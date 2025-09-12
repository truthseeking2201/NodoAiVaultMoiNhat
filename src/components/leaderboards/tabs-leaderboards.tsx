import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabLeaderboard } from "@/types/leaderboards.types";
import { LEADERBOARD_TYPE_OPTIONS } from "@/config/constants-types";

export const TabsLeaderboards = ({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (tab: TabLeaderboard) => void;
}) => {
  return (
    <Tabs value={tab} onValueChange={(value: TabLeaderboard) => setTab(value)}>
      <TabsList className="flex gap-0 relative z-10 w-full p-0 bg-black/50 rounded-b-none rounded-t-md md:rounded-t-xl overflow-hidden !border-b-0 border-white/35">
        {LEADERBOARD_TYPE_OPTIONS.map((t) => {
          const isActive = tab === t.value;
          return (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className={cn(
                "w-full h-[32px] md:h-[60px] !rounded-none bg-transparent transition-all duration-500 group"
              )}
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
                    "text-ai-dark": isActive,
                    "gradient-3rd opacity-70 group-hover:opacity-100":
                      !isActive,
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
