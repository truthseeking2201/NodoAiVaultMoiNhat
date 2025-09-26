import http from "@/utils/http";
import { isMockMode } from "@/config/mock";
import {
  mockConfigLeaderboardsRewards,
  mockLeaderboardsLastWeek,
  mockLeaderboardsThisWeek,
  mockUserLeaderboard,
} from "@/mocks";

const URLS = {
  leaderboardThisWeek: `/data-management/external/user/leaderboard/this-week-leaderboard`,
  configRewards: `/data-management/external/user/leaderboard/config-rewards`,
  leaderboardLastWeek: `/data-management/external/user/leaderboard/last-week-leaderboard`,
  userLeaderboard: `/data-management/external/user/leaderboard/info`,
};

export const getLeaderboardThisWeek = (params) => {
  if (isMockMode) {
    return Promise.resolve(mockLeaderboardsThisWeek);
  }
  return http.get(URLS.leaderboardThisWeek, { params });
};

export const getLeaderboardLastWeek = (params) => {
  if (isMockMode) {
    return Promise.resolve(mockLeaderboardsLastWeek);
  }
  return http.get(URLS.leaderboardLastWeek, { params });
};

export const getUserLeaderboard = (params: any) => {
  if (isMockMode) {
    return Promise.resolve(mockUserLeaderboard);
  }
  return http.get(URLS.userLeaderboard, {
    params: params,
  });
};

export const getConfigRewards = () => {
  if (isMockMode) {
    return Promise.resolve(mockConfigLeaderboardsRewards);
  }
  return http.get(URLS.configRewards);
};
