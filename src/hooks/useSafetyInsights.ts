import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type SafetyAgentEvent,
  type SafetyScoreHistoryPoint,
  type SafetyScoreSnapshot,
  type SafetyTier,
  type SafetyVaultState,
  mockAgentEvents,
  mockSafetyScore,
  mockScoreHistory,
  mockVaultState,
  tierCopy,
} from "@/mocks/safety-score";

export type SafetyInsights = {
  snapshot: SafetyScoreSnapshot | null;
  history: SafetyScoreHistoryPoint[];
  vaultState: SafetyVaultState | null;
  agentEvents: SafetyAgentEvent[];
  latestEvent: SafetyAgentEvent | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  policySummary: PolicySummary | null;
};

type PolicySummary = {
  tier: SafetyTier;
  score: number;
  tone: "positive" | "neutral" | "warning";
  headline: string;
  supportingCopy: string | null;
  largeDepositThresholdUsd: number;
  largeDepositThresholdPct: number;
  minimumScoreForLargeDeposit: number;
  autoPauseBelowScore: number;
  cooldownHours: number;
};

type SafetyInsightsState = {
  snapshot: SafetyScoreSnapshot;
  history: SafetyScoreHistoryPoint[];
  vaultState: SafetyVaultState;
  agentEvents: SafetyAgentEvent[];
};

const NETWORK_LATENCY_MS = 240;

export function useSafetyInsights(vaultId?: string): SafetyInsights {
  const [state, setState] = useState<SafetyInsightsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const hydrateFromMocks = useCallback((): SafetyInsightsState => {
    const nextSnapshot: SafetyScoreSnapshot = {
      ...mockSafetyScore,
      vaultId: vaultId ?? mockSafetyScore.vaultId,
      updatedAt: new Date().toISOString(),
    };

    return {
      snapshot: nextSnapshot,
      history: mockScoreHistory.map((point) => ({ ...point })),
      vaultState: {
        ...mockVaultState,
        vaultId: vaultId ?? mockVaultState.vaultId,
      },
      agentEvents: mockAgentEvents.map((event) => ({ ...event })),
    };
  }, [vaultId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for real API integration
      await new Promise((resolve) => setTimeout(resolve, NETWORK_LATENCY_MS));
      const next = hydrateFromMocks();
      setState(next);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [hydrateFromMocks]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const policySummary = useMemo<PolicySummary | null>(() => {
    if (!state) return null;
    return derivePolicySummary(state.snapshot, state.vaultState);
  }, [state]);

  return useMemo(
    () => ({
      snapshot: state?.snapshot ?? null,
      history: state?.history ?? [],
      vaultState: state?.vaultState ?? null,
      agentEvents: state?.agentEvents ?? [],
      latestEvent: state?.agentEvents.at(-1) ?? null,
      loading,
      error,
      refresh,
      policySummary,
    }),
    [state, loading, error, refresh, policySummary]
  );
}

function derivePolicySummary(
  snapshot: SafetyScoreSnapshot,
  vaultState: SafetyVaultState
): PolicySummary {
  const tier = snapshot.tier;
  const copy = tierCopy[tier];

  const tone: PolicySummary["tone"] =
    tier === "SAFE" ? "positive" : tier === "CAUTIOUS" ? "neutral" : "warning";

  const supportingCopy = (() => {
    if (tier === "SAFE") {
      return copy?.desc ?? null;
    }
    if (tier === "CAUTIOUS") {
      return (
        copy?.desc ??
        "Consider smaller clips and monitor policy bands before scaling entries."
      );
    }
    return (
      copy?.desc ??
      `Automation will re-evaluate in ${vaultState.cooldownHours} hours.`
    );
  })();

  const largeDepositThresholdUsd = Math.max(
    0,
    (vaultState.tvlUsd * vaultState.largeDepositThresholdPct) / 100
  );

  return {
    tier,
    score: snapshot.score,
    tone,
    headline: copy?.title ?? "Safety guidance unavailable",
    supportingCopy,
    largeDepositThresholdUsd,
    largeDepositThresholdPct: vaultState.largeDepositThresholdPct,
    minimumScoreForLargeDeposit: vaultState.minimumScoreForLargeDeposit,
    autoPauseBelowScore: vaultState.autoPauseBelowScore,
    cooldownHours: vaultState.cooldownHours,
  };
}

export { derivePolicySummary };
export type { PolicySummary };
