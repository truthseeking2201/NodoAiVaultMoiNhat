export type Visibility = "private" | "public";
export type Role = "owner" | "member";
export type MemberStatus = "active" | "removed" | "left";
export type ScoreMetric = "pnl_pct_weekly" | "pnl_usd_weekly";

export type PoolInvite = {
  token: string;
  expiresAt: number;
  status: "active" | "revoked" | "expired";
};

export type Pool = {
  poolId: string;
  vaultId: string;
  name: string;
  visibility: Visibility;
  maxMembers: number;
  ownerWallet: string;
  eligibilityThresholdUSD?: number;
  scoring: ScoreMetric;
  createdAt: number;
  invite?: PoolInvite;
};

export type PoolSummary = Pool & {
  activeMembers: number;
  viewerRole: Role | null;
};

export type PoolMember = {
  poolId: string;
  wallet: string;
  role: Role;
  joinedAt: number;
  status: MemberStatus;
};

export type HoldingSnapshot = {
  totalDepositsUSD: number;
  totalWithdrawalsUSD: number;
  currentValueUSD: number;
  ndlp: number;
  alias: string;
  updatedAt: number;
};

export type ScoreRow = {
  wallet: string;
  alias: string;
  netInvestedUSD: number;
  currentValueUSD: number;
  pnlUSD: number;
  pnlPct: number;
  ndlp: number;
  updatedAt: number;
  eligible: boolean;
  role: Role;
};

export type ScoreboardQuery = {
  window: "7d" | "30d";
  metric: "pnl_pct" | "pnl_usd";
};

export type AnalyticsEvent =
  | { type: "community_pool_create"; vaultId: string; poolId: string }
  | { type: "community_pool_join"; poolId: string }
  | { type: "community_pool_leave"; poolId: string }
  | { type: "community_invite_create"; poolId: string; expiresAt: number }
  | { type: "community_invite_revoke"; poolId: string }
  | { type: "community_scoreboard_view"; poolId: string }
  | { type: "community_scoreboard_filter_change"; poolId: string; query: ScoreboardQuery };
