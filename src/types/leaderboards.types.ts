export type LeaderboardsItemData = {
  tvl_usd: string;
  reward_gems: string;
  reward_xp_shares: string;
  reward_usdc: string;
  aggregation_sources: any;
  datetime_from: string;
  datetime_to: string;
  ranking: number;
  user_wallet: string;
};

export type LeaderboardsData = {
  list: LeaderboardsItemData[];
  isoDatetimeFrom: string;
  isoDatetimeTo: string;
  lastUpdate: string;
};

export type UserLeaderboardsData = {
  rank: number;
};

export type ConfigLeaderboardsData = {
  rank: number;
};
