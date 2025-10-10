import { getMockDB, setMockDB, updateMockDB } from "./mock-db";
import { seedCommunityMock } from "./mock-seed";
import {
  Pool,
  PoolMember,
  PoolSummary,
  ScoreboardQuery,
  ScoreRow,
  Visibility,
  ScoreMetric,
} from "../types";
import { logCommunityEvent } from "./mock-analytics";

const MIN_LATENCY = 200;
const MAX_LATENCY = 600;
const ERROR_RATE = 0.05;

export class CommunityError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const randomId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const shortAlias = (wallet: string) =>
  `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;

const withLatency = async <T>(fn: () => T): Promise<T> => {
  await new Promise((resolve) =>
    setTimeout(resolve, MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY))
  );
  if (Math.random() < ERROR_RATE) {
    throw new CommunityError("network_error", "Temporary mock network issue");
  }
  return fn();
};

const requireWallet = (wallet?: string | null) => {
  if (!wallet) {
    throw new CommunityError("unauthenticated", "Connect wallet to continue");
  }
  return wallet;
};

seedCommunityMock();

const ensureHolding = (wallet: string, vaultId: string) => {
  const db = getMockDB();
  const key = `${wallet}_${vaultId}`;
  if (!db.holdings[key]) {
    db.holdings[key] = {
      totalDepositsUSD: 0,
      totalWithdrawalsUSD: 0,
      currentValueUSD: 0,
      ndlp: 0,
      alias: shortAlias(wallet),
      updatedAt: Date.now(),
    };
    setMockDB(db);
  }
};

const decoratePool = (pool: Pool, wallet?: string | null): PoolSummary => {
  const db = getMockDB();
  const members = db.members.filter(
    (member) => member.poolId === pool.poolId && member.status === "active"
  );
  const activeCount = members.length;
  const viewerMember = wallet
    ? members.find((member) => member.wallet === wallet)
    : undefined;
  return {
    ...pool,
    activeMembers: activeCount,
    viewerRole: viewerMember?.role ?? null,
  };
};

export type CreatePoolPayload = {
  vaultId: string;
  name: string;
  visibility: Visibility;
  maxMembers: number;
  eligibilityThresholdUSD?: number;
  scoring: ScoreMetric;
};

export const createPool = async (
  payload: CreatePoolPayload,
  wallet?: string | null
): Promise<{ poolId: string; inviteUrl: string; name: string }> =>
  withLatency(() => {
    const owner = requireWallet(wallet);
    if (!payload.name.trim()) {
      throw new CommunityError("validation_name", "Pool name is required");
    }
    if (payload.maxMembers < 2) {
      throw new CommunityError(
        "validation_max_members",
        "Max members must be at least 2"
      );
    }

    const db = getMockDB();
    const existingNames = db.pools.filter(
      (pool) =>
        pool.vaultId === payload.vaultId &&
        pool.ownerWallet.toLowerCase() === owner.toLowerCase()
    );

    let finalName = payload.name.trim();
    const hasCollision = existingNames.some(
      (pool) => pool.name.toLowerCase() === finalName.toLowerCase()
    );
    if (hasCollision) {
      finalName = `${finalName} #${existingNames.length + 1}`;
    }

    const poolId = randomId("pool");
    const now = Date.now();
    const inviteToken = randomId("invite");
    const inviteExpiresAt = now + 168 * 60 * 60 * 1000;

    const newPool: Pool = {
      poolId,
      vaultId: payload.vaultId,
      name: finalName,
      visibility: payload.visibility,
      maxMembers: payload.maxMembers,
      ownerWallet: owner,
      eligibilityThresholdUSD: payload.eligibilityThresholdUSD,
      scoring: payload.scoring,
      createdAt: now,
      invite: {
        token: inviteToken,
        expiresAt: inviteExpiresAt,
        status: "active",
      },
    };

    const ownerMember: PoolMember = {
      poolId,
      wallet: owner,
      role: "owner",
      joinedAt: now,
      status: "active",
    };

    db.pools.push(newPool);
    db.members.push(ownerMember);
    ensureHolding(owner, payload.vaultId);
    setMockDB(db);

    const inviteUrl = `/vault/${payload.vaultId}/community/${poolId}?invite=${inviteToken}`;
    logCommunityEvent({ type: "community_pool_create", vaultId: payload.vaultId, poolId });
    logCommunityEvent({
      type: "community_invite_create",
      poolId,
      expiresAt: inviteExpiresAt,
    });

    return { poolId, inviteUrl, name: finalName };
  });

export const listPools = async (
  vaultId: string,
  scope: "mine" | "public",
  wallet?: string | null
): Promise<PoolSummary[]> =>
  withLatency(() => {
    const db = getMockDB();
    const viewer = wallet ?? null;

    if (scope === "mine") {
      const current = requireWallet(viewer);
      const memberPoolIds = db.members
        .filter(
          (member) =>
            member.wallet === current &&
            member.status === "active"
        )
        .map((member) => member.poolId);
      return db.pools
        .filter(
          (pool) =>
            pool.vaultId === vaultId && memberPoolIds.includes(pool.poolId)
        )
        .map((pool) => decoratePool(pool, viewer));
    }

    return db.pools
      .filter((pool) => pool.vaultId === vaultId && pool.visibility === "public")
      .map((pool) => decoratePool(pool, viewer));
  });

export type PoolDetailResponse = {
  pool: PoolSummary;
  members: Array<PoolMember & { alias: string }>;
  isMember: boolean;
  viewerRole: "owner" | "member" | null;
};

export const getPoolDetail = async (
  poolId: string,
  wallet?: string | null
): Promise<PoolDetailResponse> =>
  withLatency(() => {
    const db = getMockDB();
    const pool = db.pools.find((item) => item.poolId === poolId);
    if (!pool) {
      throw new CommunityError("not_found", "Pool not found");
    }

    const viewer = wallet ?? null;
    const members = db.members.filter((member) => member.poolId === poolId);
    const activeMembers = members.filter((member) => member.status === "active");
    const isMember = !!activeMembers.find((member) => member.wallet === viewer);

    if (pool.visibility === "private" && !isMember) {
    throw new CommunityError("private_pool", "Private vault. Invite required");
    }

    const roster = members.map((member) => {
      const key = `${member.wallet}_${pool.vaultId}`;
      const holding = db.holdings[key];
      return {
        ...member,
        alias: holding?.alias ?? shortAlias(member.wallet),
      };
    });

    const viewerRole = isMember
      ? activeMembers.find((member) => member.wallet === viewer)?.role ?? null
      : null;

    return {
      pool: decoratePool(pool, viewer),
      members: roster,
      isMember,
      viewerRole,
    };
  });

export const newInvite = async (
  poolId: string,
  hours: number = 168,
  wallet?: string | null
): Promise<{ inviteUrl: string; expiresAt: number }> =>
  withLatency(() => {
    const owner = requireWallet(wallet);
    const db = getMockDB();
    const pool = db.pools.find((item) => item.poolId === poolId);
    if (!pool) {
      throw new CommunityError("not_found", "Pool not found");
    }
    if (pool.ownerWallet !== owner) {
      throw new CommunityError("not_authorized", "Owner only action");
    }

    const token = randomId("invite");
    const expiresAt = Date.now() + hours * 60 * 60 * 1000;
    pool.invite = { token, expiresAt, status: "active" };
    setMockDB(db);

    const inviteUrl = `/vault/${pool.vaultId}/community/${pool.poolId}?invite=${token}`;
    logCommunityEvent({
      type: "community_invite_create",
      poolId,
      expiresAt,
    });
    return { inviteUrl, expiresAt };
  });

const assertCapacity = (pool: Pool, dbMembers: PoolMember[]) => {
  const activeMembers = dbMembers.filter(
    (member) => member.poolId === pool.poolId && member.status === "active"
  );
  if (activeMembers.length >= pool.maxMembers) {
    throw new CommunityError("pool_full", "Vault is full");
  }
};

export const joinByInvite = async (
  inviteToken: string,
  wallet?: string | null
): Promise<{ poolId: string }> =>
  withLatency(() => {
    const joiner = requireWallet(wallet);
    const db = getMockDB();
    const pool = db.pools.find(
      (item) => item.invite?.token === inviteToken && item.invite.status === "active"
    );

    if (!pool || !pool.invite) {
      throw new CommunityError("invite_invalid", "Invite is invalid");
    }

    if (Date.now() > pool.invite.expiresAt) {
      pool.invite.status = "expired";
      setMockDB(db);
      throw new CommunityError("invite_expired", "Invite expired");
    }

    const existingMember = db.members.find(
      (member) => member.poolId === pool.poolId && member.wallet === joiner
    );
    if (existingMember && existingMember.status === "active") {
      return { poolId: pool.poolId };
    }

    assertCapacity(pool, db.members);

    const now = Date.now();
    if (existingMember) {
      existingMember.status = "active";
      existingMember.joinedAt = now;
    } else {
      db.members.push({
        poolId: pool.poolId,
        wallet: joiner,
        role: "member",
        joinedAt: now,
        status: "active",
      });
    }

    ensureHolding(joiner, pool.vaultId);
    setMockDB(db);
    logCommunityEvent({ type: "community_pool_join", poolId: pool.poolId });
    return { poolId: pool.poolId };
  });

export const leavePool = async (
  poolId: string,
  wallet?: string | null
): Promise<void> =>
  withLatency(() => {
    const leaver = requireWallet(wallet);
    const db = getMockDB();
    const pool = db.pools.find((item) => item.poolId === poolId);
    if (!pool) {
      throw new CommunityError("not_found", "Pool not found");
    }
    if (pool.ownerWallet === leaver) {
      throw new CommunityError(
        "owner_cannot_leave",
        "Transfer ownership before leaving"
      );
    }

    const member = db.members.find(
      (item) => item.poolId === poolId && item.wallet === leaver
    );
    if (!member || member.status !== "active") {
      return;
    }
    member.status = "left";
    setMockDB(db);
    logCommunityEvent({ type: "community_pool_leave", poolId });
  });

export const removeMember = async (
  poolId: string,
  targetWallet: string,
  wallet?: string | null
): Promise<void> =>
  withLatency(() => {
    const owner = requireWallet(wallet);
    const db = getMockDB();
    const pool = db.pools.find((item) => item.poolId === poolId);
    if (!pool) {
      throw new CommunityError("not_found", "Pool not found");
    }
    if (pool.ownerWallet !== owner) {
      throw new CommunityError("not_authorized", "Owner only action");
    }
    if (targetWallet === owner) {
      throw new CommunityError("cannot_remove_owner", "Transfer ownership first");
    }

    const member = db.members.find(
      (item) => item.poolId === poolId && item.wallet === targetWallet
    );
    if (!member) {
      throw new CommunityError("member_missing", "Member not found");
    }

    member.status = "removed";
    setMockDB(db);
  });

export const transferOwnership = async (
  poolId: string,
  targetWallet: string,
  wallet?: string | null
): Promise<void> =>
  withLatency(() => {
    const owner = requireWallet(wallet);
    const db = getMockDB();
    const pool = db.pools.find((item) => item.poolId === poolId);
    if (!pool) {
      throw new CommunityError("not_found", "Pool not found");
    }
    if (pool.ownerWallet !== owner) {
      throw new CommunityError("not_authorized", "Owner only action");
    }
    if (targetWallet === owner) {
      return;
    }

    const target = db.members.find(
      (item) => item.poolId === poolId && item.wallet === targetWallet
    );
    if (!target || target.status !== "active") {
      throw new CommunityError("member_missing", "Target must be an active member");
    }

    pool.ownerWallet = targetWallet;

    const previousOwner = db.members.find(
      (item) => item.poolId === poolId && item.wallet === owner
    );
    if (previousOwner) previousOwner.role = "member";
    target.role = "owner";
    setMockDB(db);
  });

export const getScoreboard = async (
  poolId: string,
  query: ScoreboardQuery,
  wallet?: string | null
): Promise<{ rows: ScoreRow[] }> =>
  withLatency(() => {
    const db = getMockDB();
    const pool = db.pools.find((item) => item.poolId === poolId);
    if (!pool) {
      throw new CommunityError("not_found", "Pool not found");
    }

    const members = db.members.filter(
      (member) => member.poolId === poolId && member.status === "active"
    );

    const rows: ScoreRow[] = members.map((member) => {
      const key = `${member.wallet}_${pool.vaultId}`;
      const holding = db.holdings[key];
      const rawNet =
        (holding?.totalDepositsUSD ?? 0) - (holding?.totalWithdrawalsUSD ?? 0);
      const netInvestedUSD = Math.max(0, rawNet);
      const currentValueUSD = holding?.currentValueUSD ?? 0;
      const pnlUSD = currentValueUSD - netInvestedUSD;
      const pnlPct = netInvestedUSD > 0 ? (pnlUSD / netInvestedUSD) * 100 : 0;
      const alias = holding?.alias ?? shortAlias(member.wallet);
      return {
        wallet: member.wallet,
        alias,
        netInvestedUSD,
        currentValueUSD,
        pnlUSD,
        pnlPct,
        ndlp: holding?.ndlp ?? 0,
        updatedAt: holding?.updatedAt ?? 0,
        eligible:
          pool.eligibilityThresholdUSD !== undefined
            ? netInvestedUSD >= pool.eligibilityThresholdUSD
            : true,
        role: member.role,
      } satisfies ScoreRow;
    });

    const memberMeta = new Map<string, PoolMember>();
    members.forEach((member) => memberMeta.set(member.wallet, member));

    const metricKey = query.metric === "pnl_pct" ? "pnlPct" : "pnlUSD";

    rows.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      const diff = (b as any)[metricKey] - (a as any)[metricKey];
      if (diff !== 0) return diff;
      const netDiff = b.netInvestedUSD - a.netInvestedUSD;
      if (netDiff !== 0) return netDiff;
      const joinedA = memberMeta.get(a.wallet)?.joinedAt ?? 0;
      const joinedB = memberMeta.get(b.wallet)?.joinedAt ?? 0;
      return joinedA - joinedB;
    });

    logCommunityEvent({
      type: "community_scoreboard_view",
      poolId,
    });

    return { rows };
  });

export const manualScoreboardRefresh = async (poolId: string) =>
  withLatency(() => {
    logCommunityEvent({ type: "community_scoreboard_view", poolId });
    return { ok: true };
  });
