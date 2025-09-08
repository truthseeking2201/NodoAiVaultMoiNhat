import http from "@/utils/http";

const URLS = {
  tvlLeaderboardThisWeek: `/data-management/external/user/leaderboard/this-week-tvl-leaderboard`,
  // TODO
  tvlLeaderboardLastWeek: `/data-management/external/user/leaderboard/this-week-tvl-leaderboard`,
  referredTVLLeaderboardThisWeek: `/data-management/external/user/leaderboard/this-week-tvl-leaderboard`,
  referredTVLLeaderboardLastWeek: `/data-management/external/user/leaderboard/this-week-tvl-leaderboard`,
  userLeaderboard: `/data-management/external/vaults/list`,
  configLeaderboard: `/data-management/external/vaults/list`,
};

export const getTVLLeaderboardThisWeek = () => {
  return http.get(URLS.tvlLeaderboardThisWeek);
};
export const getTVLLeaderboardLastWeek = () => {
  return http.get(URLS.tvlLeaderboardLastWeek);
};

export const getReferredTVLLeaderboardThisWeek = () => {
  return http.get(URLS.referredTVLLeaderboardThisWeek);
};
export const getReferredTVLLeaderboardLastWeek = () => {
  return http.get(URLS.referredTVLLeaderboardLastWeek);
};

export const getUserLeaderboard = (params: any) => {
  return http.get(URLS.userLeaderboard, {
    params: params,
  });
};

export const getConfigLeaderboard = () => {
  return http.get(URLS.configLeaderboard);
};
