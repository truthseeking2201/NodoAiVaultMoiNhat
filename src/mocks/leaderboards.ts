import {
  ConfigLeaderboardsRewards,
  LeaderboardsData,
  UserLeaderboardsData,
} from "@/types/leaderboards.types";

const now = new Date();
const startOfWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

export const mockLeaderboardsThisWeek: LeaderboardsData = {
  list: Array.from({ length: 10 }).map((_, index) => ({
    ranking: index + 1,
    user_wallet: `0xleader${index}`.padEnd(66, "0"),
    reward_gems: (5000 - index * 250).toFixed(0),
    reward_xp_shares: (2500 - index * 120).toFixed(0),
    reward_usdc: (10000 - index * 500).toFixed(2),
    aggregation_sources: { vaults: 6 + index },
    datetime_from: startOfWeek.toISOString(),
    datetime_to: now.toISOString(),
    tvl_usd: (1500000 - index * 50000).toFixed(2),
    ref_tvl_usd: (800000 - index * 25000).toFixed(2),
  })),
  isoDatetimeFrom: startOfWeek.toISOString(),
  isoDatetimeTo: now.toISOString(),
  lastUpdate: now.toISOString(),
};

export const mockLeaderboardsLastWeek: LeaderboardsData = {
  ...mockLeaderboardsThisWeek,
  list: mockLeaderboardsThisWeek.list.map((entry) => ({
    ...entry,
    reward_usdc: (Number(entry.reward_usdc) * 0.85).toFixed(2),
    reward_gems: (Number(entry.reward_gems) * 0.9).toFixed(0),
    reward_xp_shares: (Number(entry.reward_xp_shares) * 0.95).toFixed(0),
  })),
};

export const mockUserLeaderboard: UserLeaderboardsData = {
  datetime_from: startOfWeek.toISOString(),
  datetime_to: now.toISOString(),
  user_wallet:
    "0xmockedcafedeadbeef00112233445566778899aabbccddeeff001122334455",
  tvl_usd: "1250000.00",
  ref_tvl_usd: "845000.00",
  tvl_ranking: 3,
  referred_ranking: 2,
};

export const mockConfigLeaderboardsRewards: ConfigLeaderboardsRewards = {
  tvl_config_rewards: {
    rankings: {
      1: { reward_gems: 10000, reward_usdc: 20000, reward_xp_shares: 8000 },
      2: { reward_gems: 7500, reward_usdc: 15000, reward_xp_shares: 6000 },
      3: { reward_gems: 5000, reward_usdc: 10000, reward_xp_shares: 4500 },
    },
    requirements: {
      min_tvl_usd: 50000,
    },
    ranking_weight: {
      by_tvl_usd: 0.7,
      by_ref_tvl_usd: 0.3,
    },
  },
  referred_config_rewards: {
    rankings: {
      1: { reward_gems: 6000, reward_usdc: 12000, reward_xp_shares: 5000 },
      2: { reward_gems: 4200, reward_usdc: 8000, reward_xp_shares: 3600 },
      3: { reward_gems: 3000, reward_usdc: 5000, reward_xp_shares: 2400 },
    },
    requirements: {
      min_ref_tvl_usd: 25000,
    },
    ranking_weight: {
      by_tvl_usd: 0.4,
      by_ref_tvl_usd: 0.6,
    },
  },
};
