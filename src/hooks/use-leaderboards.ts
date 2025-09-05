import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as api from "@/apis/leaderboards";
import * as type from "@/types/leaderboards.types";

export type TabFilterTime = "this-week" | "that-week";

export const useLeaderboard = (
  isReferTvl: boolean,
  filterTime: TabFilterTime
) => {
  return useQuery<type.LeaderboardsData, Error>({
    queryKey: ["leaderboards", isReferTvl, filterTime],
    queryFn: async () => {
      let response = null;
      if (isReferTvl) {
        response = await api.getTVLLeaderboard({});
      } else {
        response = await api.getReferredTVLLeaderboard({});
      }
      return response as unknown as type.LeaderboardsData;
    },
    enabled: true,
    refetchOnWindowFocus: true,
  });
};
