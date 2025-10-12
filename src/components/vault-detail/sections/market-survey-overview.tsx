import type { MarketSurveyOverview as MarketSurveyOverviewType } from "@/types/market-survey";
import {
  Brain,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
} from "lucide-react";

type MarketSurveyOverviewProps = {
  data?: MarketSurveyOverviewType | null;
  isLoading?: boolean;
  error?: string | null;
};

const formatScore = (value?: number | null) =>
  value != null && Number.isFinite(value) ? value.toFixed(1) : "—";

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "—";
  const prefix = value >= 0 ? "↑" : "↓";
  return `${prefix} ${Math.abs(value).toFixed(1)}%`;
};

const formatNumber = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString();
};

const formatLabel = (value?: string | number | null) => {
  if (value == null) return "—";
  if (typeof value === "number") {
    return value.toString();
  }
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getScoreTone = (score?: number | null) => {
  if (score == null) return "text-white/70";
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
};

const getSentimentTone = (sentiment?: string | number | null) => {
  if (sentiment == null) return "text-white/70";
  const lower = sentiment.toString().toLowerCase();
  if (lower.includes("optimistic") || lower.includes("greed")) {
    return "text-emerald-400";
  }
  if (lower.includes("neutral")) {
    return "text-white/70";
  }
  return "text-red-400";
};

const getTrendIcon = (trend?: string | number | null) => {
  if (trend == null) {
    return <ArrowRight className="inline w-4 h-4 text-white/40" />;
  }
  const lower = trend.toString().toLowerCase();
  if (lower.includes("up")) {
    return <ArrowUpRight className="inline w-4 h-4 text-emerald-400" />;
  }
  if (lower.includes("down")) {
    return <ArrowDownRight className="inline w-4 h-4 text-red-400" />;
  }
  return <ArrowRight className="inline w-4 h-4 text-white/40" />;
};

export function MarketSurveyOverview({
  data,
  isLoading,
  error,
}: MarketSurveyOverviewProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
        Market survey unavailable: {error}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        Loading AI market survey…
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const {
    vaultName,
    safetyScore,
    recommendation,
    confidence,
    trend,
    sentiment,
    tvl,
    tvlChange,
    updatedAt,
  } = data;

  const scoreTone = getScoreTone(safetyScore);
  const sentimentTone = getSentimentTone(sentiment);
  const trendIcon = getTrendIcon(trend);
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toUTCString()
    : "—";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 via-white/4 to-transparent p-6 text-sm text-white/80 shadow-[0_20px_45px_rgba(8,15,35,0.45)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-medium text-white">
            <Brain className="h-4 w-4 text-orange-400" />
            Market Survey Overview
          </div>
          <p className="text-xs text-white/55 mt-1">
            Latest conditions for{" "}
            <span className="text-white/75">{vaultName}</span>
          </p>
        </div>
        <div className="rounded-full border border-white/14 px-3 py-1 text-[11px] text-white/60 uppercase tracking-wide">
          AI Monitoring
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-6 md:grid-cols-3">
        <div>
          <p className="text-white/55">Safety Score</p>
          <p className={`mt-1 text-lg font-semibold ${scoreTone}`}>
            {formatScore(safetyScore)}{" "}
            {safetyScore != null && <span className="text-xs text-white/40">/ 100</span>}
          </p>
        </div>
        <div>
          <p className="text-white/55">Recommendation</p>
          <p className="mt-1 text-lg font-semibold uppercase text-white">
            {formatLabel(recommendation)}
          </p>
        </div>
        <div>
          <p className="text-white/55">Confidence</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatLabel(confidence)}
          </p>
        </div>
        <div>
          <p className="text-white/55">Trend Signal</p>
          <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-white">
            {formatLabel(trend)}
            {trendIcon}
          </p>
        </div>
        <div>
          <p className="text-white/55">Market Sentiment</p>
          <p className={`mt-1 text-lg font-semibold ${sentimentTone}`}>
            {formatLabel(sentiment)}
          </p>
        </div>
        <div>
          <p className="text-white/55">Total Value Locked</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${formatNumber(tvl)}
          </p>
          <p
            className={`text-xs ${
              tvlChange != null && tvlChange >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {formatPercent(tvlChange)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
        <p>
          <span className="text-emerald-400">●</span> Market sentiment:{" "}
          <span className={sentimentTone}>{formatLabel(sentiment)}</span>
        </p>
        <p>
          Last updated: <span className="text-white/50">{updatedLabel}</span>
        </p>
      </div>
    </div>
  );
}
