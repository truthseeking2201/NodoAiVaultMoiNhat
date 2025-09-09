import http from "@/utils/http";

const URLS = {
  leaderboardThisWeek: `/data-management/external/user/leaderboard/this-week-leaderboard`,
  configRewards: `/data-management/external/user/leaderboard/config-rewards`,
  leaderboardLastWeek: `/data-management/external/user/leaderboard/last-week-leaderboard`,
  userLeaderboard: `/data-management/external/user/leaderboard/info`,
};

export const getLeaderboardThisWeek = (params) => {
  return http.get(URLS.leaderboardThisWeek, { params });
};

export const getLeaderboardLastWeek = (params) => {
  return http.get(URLS.leaderboardLastWeek, { params });
};

export const getUserLeaderboard = (params: any) => {
  return http.get(URLS.userLeaderboard, {
    params: params,
  });
};

export const getConfigRewards = () => {
  return http.get(URLS.configRewards);
};
