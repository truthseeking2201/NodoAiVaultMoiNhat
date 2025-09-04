import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as api from "@/apis/leaderboards";
import * as type from "@/types/leaderboards.types";

export const useLeaderboardTVL = () => {
  return useQuery<type.LeaderboardsItemData[], Error>({
    queryKey: ["leaderboards-tvl"],
    queryFn: async () => {
      const response = await api.getTVLLeaderboard({});
      return response as unknown as type.LeaderboardsItemData[];
    },
    enabled: true,
    refetchOnWindowFocus: true,
  });
};

export const useLeaderboardTVLRefer = () => {
  return useQuery<type.LeaderboardsItemData[], Error>({
    queryKey: ["leaderboards-tvl-refer"],
    queryFn: async () => {
      const response = await api.getReferredTVLLeaderboard({});
      return response as unknown as type.LeaderboardsItemData[];
    },
    enabled: true,
    refetchOnWindowFocus: true,
  });
};

export const useLeaderboard = (isReferTvl: boolean) => {
  return useQuery<type.LeaderboardsItemData[], Error>({
    queryKey: ["leaderboards"],
    queryFn: async () => {
      let response = null;
      if (isReferTvl) {
        response = await api.getTVLLeaderboard({});
      } else {
        response = await api.getReferredTVLLeaderboard({});
      }
      return response as unknown as type.LeaderboardsItemData[];
    },
    enabled: true,
    refetchOnWindowFocus: true,
  });
};
