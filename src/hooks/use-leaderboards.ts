import { LEADERBOARD_TIME_FILTER } from "@/config/constants-types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as api from "@/apis/leaderboards";
import * as type from "@/types/leaderboards.types";
import { useWallet } from "@/hooks";

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
    staleTime:
      filterTime === LEADERBOARD_TIME_FILTER.lastWeek ? Infinity : 300000,
    gcTime: filterTime === LEADERBOARD_TIME_FILTER.lastWeek ? Infinity : 300000,
  });
};

export const useUserLeaderboard = () => {
  const { address } = useWallet();
  return useQuery<type.UserLeaderboardsData, Error>({
    queryKey: ["user-leaderboards", address],
    queryFn: async () => {
      const response = await api.getUserLeaderboard({ user_wallet: address });
      return response as unknown as type.UserLeaderboardsData;
    },
    enabled: !!address,
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
