import { LEADERBOARD_TIME_FILTER } from "@/config/constants-types";
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
      const params = { leaderboard_type: tab };
      const response =
        filterTime === LEADERBOARD_TIME_FILTER.thisWeek
          ? await api.getLeaderboardThisWeek(params)
          : api.getLeaderboardLastWeek(params);
      return response as unknown as type.LeaderboardsData;
    },
    enabled: true,
    refetchOnWindowFocus: true,
    staleTime: filterTime === LEADERBOARD_TIME_FILTER.lastWeek ? Infinity : 0,
    gcTime: filterTime === LEADERBOARD_TIME_FILTER.lastWeek ? Infinity : 0,
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
  return useQuery<type.ConfigLeaderboardsRewards, Error>({
    queryKey: ["config-leaderboards"],
    queryFn: async () => {
      const response = await api.getConfigRewards();
      return response as unknown as type.ConfigLeaderboardsRewards;
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });
};
