import { MockState, setMockDB, getMockDB } from "./mock-db";
import { ScoreMetric } from "../types";

const defaultWallet = "0xUSER";

const seedHoldings = (
  state: MockState,
  entries: Array<{
    wallet: string;
    vaultId: string;
    deposits: number;
    withdrawals: number;
    value: number;
    ndlp: number;
    alias: string;
  }>
) => {
  const withUpdates = { ...state.holdings };
  const now = Date.now();
  entries.forEach((entry) => {
    const key = `${entry.wallet}_${entry.vaultId}`;
    withUpdates[key] = {
      totalDepositsUSD: entry.deposits,
      totalWithdrawalsUSD: entry.withdrawals,
      currentValueUSD: entry.value,
      ndlp: entry.ndlp,
      alias: entry.alias,
      updatedAt: now,
    };
  });
  state.holdings = withUpdates;
};

const createPool = (
  state: MockState,
  params: {
    poolId: string;
    vaultId: string;
    name: string;
    visibility: "private" | "public";
    maxMembers: number;
    ownerWallet: string;
    scoring: ScoreMetric;
    createdAt: number;
    eligibilityThresholdUSD?: number;
  }
) => {
  state.pools.push({ ...params });
};

const createMember = (
  state: MockState,
  params: {
    poolId: string;
    wallet: string;
    role: "owner" | "member";
    joinedAt: number;
    status?: "active" | "removed" | "left";
  }
) => {
  state.members.push({
    poolId: params.poolId,
    wallet: params.wallet,
    role: params.role,
    joinedAt: params.joinedAt,
    status: params.status ?? "active",
  });
};

export const seedCommunityMock = (wallet: string = defaultWallet) => {
  const existing = getMockDB();
  if (existing.pools.length > 0) return;

  const vaultId = "vault-sui-USDC-USDT";
  const now = Date.now();

  const next: MockState = {
    pools: [],
    members: [],
    holdings: {},
  };

  createPool(next, {
    poolId: "pool-alpha",
    vaultId,
    name: "Alpha Squad",
    visibility: "private",
    maxMembers: 10,
    ownerWallet: wallet,
    scoring: "pnl_pct_weekly",
    createdAt: now,
  });

  createPool(next, {
    poolId: "pool-pros",
    vaultId,
    name: "Public Pros",
    visibility: "public",
    maxMembers: 8,
    ownerWallet: "0xA1",
    scoring: "pnl_usd_weekly",
    createdAt: now,
    eligibilityThresholdUSD: 500,
  });

  createPool(next, {
    poolId: "pool-maxed",
    vaultId,
    name: "Full House",
    visibility: "public",
    maxMembers: 3,
    ownerWallet: "0xA1",
    scoring: "pnl_pct_weekly",
    createdAt: now,
  });

  [
    { poolId: "pool-alpha", wallet, role: "owner" as const },
    { poolId: "pool-alpha", wallet: "0xF1", role: "member" as const },
    { poolId: "pool-pros", wallet: "0xA1", role: "owner" as const },
    { poolId: "pool-pros", wallet: "0xB2", role: "member" as const },
    { poolId: "pool-pros", wallet: "0xC3", role: "member" as const },
    { poolId: "pool-pros", wallet: "0xD4", role: "member" as const },
    { poolId: "pool-pros", wallet, role: "member" as const },
    { poolId: "pool-maxed", wallet: "0xE5", role: "owner" as const },
    { poolId: "pool-maxed", wallet: "0xE6", role: "member" as const },
    { poolId: "pool-maxed", wallet: "0xE7", role: "member" as const },
  ].forEach((entry, index) => {
    createMember(next, {
      poolId: entry.poolId,
      wallet: entry.wallet,
      role: entry.role,
      joinedAt: now - index * 60_000,
    });
  });

  seedHoldings(next, [
    {
      wallet,
      vaultId,
      deposits: 1200,
      withdrawals: 0,
      value: 1248,
      ndlp: 1187.3,
      alias: "You",
    },
    {
      wallet: "0xF1",
      vaultId,
      deposits: 800,
      withdrawals: 0,
      value: 780,
      ndlp: 792.1,
      alias: "F1",
    },
    {
      wallet: "0xA1",
      vaultId,
      deposits: 1500,
      withdrawals: 0,
      value: 1610,
      ndlp: 1477.8,
      alias: "A1",
    },
    {
      wallet: "0xB2",
      vaultId,
      deposits: 500,
      withdrawals: 0,
      value: 512,
      ndlp: 494.2,
      alias: "B2",
    },
    {
      wallet: "0xC3",
      vaultId,
      deposits: 200,
      withdrawals: 0,
      value: 187,
      ndlp: 198.7,
      alias: "C3",
    },
    {
      wallet: "0xD4",
      vaultId,
      deposits: 400,
      withdrawals: 0,
      value: 420,
      ndlp: 410.5,
      alias: "D4",
    },
    {
      wallet: "0xE5",
      vaultId,
      deposits: 900,
      withdrawals: 0,
      value: 950,
      ndlp: 910.2,
      alias: "E5",
    },
    {
      wallet: "0xE6",
      vaultId,
      deposits: 750,
      withdrawals: 0,
      value: 740,
      ndlp: 730.4,
      alias: "E6",
    },
    {
      wallet: "0xE7",
      vaultId,
      deposits: 600,
      withdrawals: 0,
      value: 610,
      ndlp: 603.3,
      alias: "E7",
    },
  ]);

  setMockDB(next);
};
