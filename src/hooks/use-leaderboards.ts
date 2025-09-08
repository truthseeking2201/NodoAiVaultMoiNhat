import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as api from "@/apis/leaderboards";
import * as type from "@/types/leaderboards.types";

export const useLeaderboard = (
  tab: type.TabLeaderboard,
  filterTime: type.TabFilterTime
) => {
  return useQuery<type.LeaderboardsData, Error>({
    queryKey: ["leaderboards", tab, filterTime],
    queryFn: async () => {
      const response =
        tab == "tvl"
          ? filterTime === "this-week"
            ? await api.getTVLLeaderboardThisWeek()
            : await api.getTVLLeaderboardLastWeek()
          : filterTime === "this-week"
          ? await api.getReferredTVLLeaderboardThisWeek()
          : await api.getReferredTVLLeaderboardLastWeek();
      return response as unknown as type.LeaderboardsData;
    },
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: filterTime === "last-week" ? Infinity : 0,
    gcTime: filterTime === "last-week" ? Infinity : 0,
  });
};

export const useUserLeaderboard = (enabled: boolean) => {
  return useQuery<type.UserLeaderboardsData, Error>({
    queryKey: ["user-leaderboards"],
    queryFn: async () => {
      const response = await api.getUserLeaderboard({});
      return response as unknown as type.UserLeaderboardsData;
    },
    enabled: enabled,
    refetchOnWindowFocus: true,
  });
};

export const useConfigLeaderboard = () => {
  return useQuery<type.ConfigLeaderboardsData, Error>({
    queryKey: ["config-leaderboards"],
    queryFn: async () => {
      const response = await api.getConfigLeaderboard();
      return response as unknown as type.ConfigLeaderboardsData;
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });
};
