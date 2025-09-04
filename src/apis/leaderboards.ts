import http from "@/utils/http";

const URLS = {
  // TODO
  tvlLeaderboard: `/data-management/external/vaults/list`,
  referredTVLLeaderboard: `/data-management/external/vaults/list`,
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
