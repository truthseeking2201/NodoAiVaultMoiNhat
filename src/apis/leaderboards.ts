import http from "@/utils/http";

const URLS = {
  leaderboardThisWeek: `/data-management/external/user/leaderboard/this-week-leaderboard`,
  // TODO
  leaderboardLastWeek: `/data-management/external/user/leaderboard/this-week-leaderboard`,
  userLeaderboard: `/data-management/external/vaults/list`,
  configLeaderboard: `/data-management/external/vaults/list`,
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

export const getConfigLeaderboard = () => {
  return http.get(URLS.configLeaderboard);
};
