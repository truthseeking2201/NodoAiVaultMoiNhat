import { useMemo } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { useSafetyInsights, type PolicySummary } from "@/hooks/useSafetyInsights";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneClassMap: Record<PolicySummary["tone"], string> = {
  positive: "border-emerald-400/30 bg-emerald-500/10",
  neutral: "border-white/15 bg-white/5",
  warning: "border-orange-400/30 bg-orange-500/10",
};

type SafetyInsightsCardProps = {
  vaultId?: string;
};

export function SafetyInsightsCard({ vaultId }: SafetyInsightsCardProps) {
  const { snapshot, latestEvent, loading, error, refresh, policySummary } =
    useSafetyInsights(vaultId);

  const freshnessLabel = useMemo(() => {
    if (!snapshot) return "";
    if (snapshot.freshnessMinutes <= 1) return "Updated just now";
    return `Updated ${snapshot.freshnessMinutes} min ago`;
  }, [snapshot]);

  return (
    <DetailWrapper title="Safety Insights" isLoading={loading}>
      {error ? (
        <div className="space-y-3 text-sm text-white/70">
          <p className="font-medium text-red-200">Unable to load safety data.</p>
          <p className="text-white/60">
            Please try again in a moment. This does not impact execution but limits
            visibility into guardrails.
          </p>
          <Button
            type="button"
            onClick={refresh}
            className="bg-white/15 text-white hover:bg-white/20"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!error && snapshot && policySummary ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Tier & score
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                  {policySummary.tier}
                </span>
                <span className="text-2xl font-semibold text-white">
                  {policySummary.score.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-white/50">
              <p>Status</p>
              <p className="text-white/80">{freshnessLabel}</p>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm text-white/85",
              toneClassMap[policySummary.tone]
            )}
          >
            <p className="font-medium">{policySummary.headline}</p>
            {policySummary.supportingCopy ? (
              <p className="mt-2 text-sm text-white/70">
                {policySummary.supportingCopy}
              </p>
            ) : null}
          </div>

          <dl className="space-y-2 text-xs text-white/60">
            <div className="flex items-center justify-between">
              <dt>Large deposit threshold</dt>
              <dd className="text-white/80">
                {formatUsd(policySummary.largeDepositThresholdUsd)} (
                {policySummary.largeDepositThresholdPct}% of TVL)
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Minimum score for large deposit</dt>
              <dd className="text-white/80">
                {policySummary.minimumScoreForLargeDeposit}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Auto-pause below score</dt>
              <dd className="text-white/80">
                {policySummary.autoPauseBelowScore}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Re-check cadence</dt>
              <dd className="text-white/80">
                Every {policySummary.cooldownHours} hrs
              </dd>
            </div>
          </dl>

          {latestEvent ? (
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Latest signal
              </p>
              <p className="text-sm font-medium text-white/85">
                {latestEvent.type}
              </p>
              {latestEvent.detail ? (
                <p className="text-sm text-white/70">{latestEvent.detail}</p>
              ) : null}
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {formatTimestamp(latestEvent.timestamp)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/60">No recent agent signals.</p>
          )}
        </div>
      ) : null}

      {!error && !loading && !snapshot ? (
        <p className="text-sm text-white/70">
          Safety telemetry is not available for this vault yet.
        </p>
      ) : null}
    </DetailWrapper>
  );
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
