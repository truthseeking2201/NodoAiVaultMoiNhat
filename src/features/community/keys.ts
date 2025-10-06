import { ScoreboardQuery } from "./types";

export const COMMUNITY_QUERY_KEYS = {
  pools: (vaultId: string, scope: "mine" | "public") => [
    "community",
    "pools",
    vaultId,
    scope,
  ] as const,
  pool: (poolId: string) => ["community", "pool", poolId] as const,
  scoreboard: (poolId: string, query: ScoreboardQuery) => [
    "community",
    "scoreboard",
    poolId,
    query.window,
    query.metric,
  ] as const,
};
