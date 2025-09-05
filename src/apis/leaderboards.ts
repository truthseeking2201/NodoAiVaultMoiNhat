import http from "@/utils/http";

const URLS = {
  // TODO
  tvlLeaderboard: `/data-management/external/vaults/list`,
  referredTVLLeaderboard: `/data-management/external/vaults/list`,
  userLeaderboard: `/data-management/external/vaults/list`,
  configLeaderboard: `/data-management/external/vaults/list`,
};

export const getTVLLeaderboard = (params: any) => {
  return http.get(URLS.tvlLeaderboard, {
    params: params,
  });
};

export const getReferredTVLLeaderboard = (params: any) => {
  return http.get(URLS.referredTVLLeaderboard, {
    params: params,
  });
};

export const getUserLeaderboard = (params: any) => {
  return http.get(URLS.userLeaderboard, {
    params: params,
  });
};

export const getConfigLeaderboard = () => {
  return http.get(URLS.configLeaderboard);
};
