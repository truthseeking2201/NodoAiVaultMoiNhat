import {
  LEADERBOARD_TYPE,
  LEADERBOARD_TIME_FILTER,
} from "@/config/constants-types";

export type TabLeaderboard =
  (typeof LEADERBOARD_TYPE)[keyof typeof LEADERBOARD_TYPE];
export type TabFilterTime =
  (typeof LEADERBOARD_TIME_FILTER)[keyof typeof LEADERBOARD_TIME_FILTER];

export type LeaderboardsItemData = {
  tvl_usd?: string;
  ref_tvl_usd?: string;
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
  datetime_from: string;
  datetime_to: string;
  user_wallet: string;
  tvl_usd: string;
  ref_tvl_usd: string;
  tvl_ranking: number;
  referred_ranking: number;
};

export type RewardEntry = {
  reward_gems: number;
  reward_usdc: number;
  reward_xp_shares: number;
};
export type Rankings = Record<string, RewardEntry>;
export type Requirements = {
  min_tvl_usd?: number;
  min_ref_tvl_usd?: number;
};
export type RankingWeight = {
  by_tvl_usd?: number;
  by_ref_tvl_usd?: number;
};
export type ConfigRewards = {
  rankings: Rankings;
  requirements: Requirements;
  ranking_weight: RankingWeight;
};
export type ConfigLeaderboardsRewards = {
  tvl_config_rewards: ConfigRewards;
  referred_config_rewards: ConfigRewards;
};
