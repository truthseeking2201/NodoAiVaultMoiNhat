import { useMemo } from "react";
import { ScoreRow, ScoreboardQuery } from "../types";
import { cn } from "@/lib/utils";
import { showFormatNumber, formatNumber } from "@/lib/number";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useBreakpoint from "@/hooks/use-breakpoint";

const windows: Array<{ label: string; value: ScoreboardQuery["window"] }> = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
];

const metrics: Array<{ label: string; value: ScoreboardQuery["metric"] }> = [
  { label: "PnL %", value: "pnl_pct" },
  { label: "PnL USD", value: "pnl_usd" },
];

type ScoreboardProps = {
  rows: ScoreRow[];
  loading?: boolean;
  error?: string | null;
  query: ScoreboardQuery;
  onQueryChange: (query: ScoreboardQuery) => void;
  onRefresh: () => void;
  refreshing?: boolean;
};

const relativeTime = (timestamp: number) => {
  if (!timestamp) return "--";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes <= 0) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const Scoreboard = ({
  rows,
  loading,
  error,
  query,
  onQueryChange,
  onRefresh,
  refreshing,
}: ScoreboardProps) => {
  const { isMobile } = useBreakpoint();

  const rankedRows = useMemo(() => {
    let rank = 0;
    return rows.map((row) => {
      const displayRank = row.eligible ? ++rank : null;
      return { ...row, displayRank };
    });
  }, [rows]);

  const latestUpdate = useMemo(() => {
    const timestamps = rows.map((row) => row.updatedAt).filter(Boolean);
    if (!timestamps.length) return null;
    return Math.max(...timestamps);
  }, [rows]);

  const renderFilters = () => (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        {windows.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "text-xs px-3 py-1.5 rounded-md border transition-colors",
              query.window === item.value
                ? "border-white/40 bg-white/10 text-white"
                : "border-white/10 text-white/70 hover:border-white/20"
            )}
            onClick={() => onQueryChange({ ...query, window: item.value })}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {metrics.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "text-xs px-3 py-1.5 rounded-md border transition-colors",
              query.metric === item.value
                ? "border-white/40 bg-white/10 text-white"
                : "border-white/10 text-white/70 hover:border-white/20"
            )}
            onClick={() => onQueryChange({ ...query, metric: item.value })}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderRowDesktop = (row: ScoreRow & { displayRank: number | null }) => {
    const pnlClass = row.pnlUSD === 0 ? "text-white" : row.pnlUSD > 0 ? "text-green-increase" : "text-red-400";
    const pctClass = row.pnlPct === 0 ? "text-white" : row.pnlPct > 0 ? "text-green-increase" : "text-red-400";
    const observer = row.eligible === false;
    return (
      <div
        key={row.wallet}
        className={cn(
          "grid grid-cols-[60px_1fr_repeat(4,minmax(0,1fr))] gap-3 px-4 py-3 border-b border-white/5",
          observer ? "text-white/50" : "text-white"
        )}
      >
        <div className="text-sm font-mono text-white/60">
          {observer ? "—" : row.displayRank}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{row.alias}</div>
          <div className="text-[11px] text-white/40">{observer ? "Observer" : row.role === "owner" ? "Owner" : "Member"}</div>
        </div>
        <div className="text-sm font-mono text-white">
          {showFormatNumber(row.netInvestedUSD, 0, 2, "$")}
        </div>
        <div className={cn("text-sm font-mono", pnlClass)}>
          {showFormatNumber(row.pnlUSD, 0, 2, "$")}
        </div>
        <div className={cn("text-sm font-mono", pctClass)}>
          {formatNumber(row.pnlPct, 0, 2)}%
        </div>
        <div className="text-sm font-mono text-white">
          {formatNumber(row.ndlp, 0, 2)}
        </div>
        <div className="text-xs text-white/50 text-right">
          {relativeTime(row.updatedAt)}
        </div>
      </div>
    );
  };

  const renderRowMobile = (row: ScoreRow & { displayRank: number | null }) => {
    const pnlClass = row.pnlUSD === 0 ? "text-white" : row.pnlUSD > 0 ? "text-green-increase" : "text-red-400";
    const pctClass = row.pnlPct === 0 ? "text-white" : row.pnlPct > 0 ? "text-green-increase" : "text-red-400";
    const observer = row.eligible === false;
    return (
      <div
        key={row.wallet}
        className={cn(
          "flex flex-col gap-1 px-4 py-3 border-b border-white/5",
          observer ? "text-white/50" : "text-white"
        )}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-white/60">
              {observer ? "—" : row.displayRank}
            </span>
            <span className="font-medium text-white">{row.alias}</span>
          </div>
          <span className={cn("font-mono", pctClass)}>
            {formatNumber(row.pnlPct, 0, 2)}%
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
          <span>Deposit {showFormatNumber(row.netInvestedUSD, 0, 2, "$")}</span>
          <span className={cn("font-mono", pnlClass)}>
            PnL {showFormatNumber(row.pnlUSD, 0, 2, "$")}
          </span>
          <span>{relativeTime(row.updatedAt)}</span>
        </div>
        <div className="text-[11px] text-white/40">
          {observer ? "Observer" : row.role === "owner" ? "Owner" : "Member"}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-white/10">
        <div>
          <div className="text-white font-semibold text-base">Scoreboard</div>
          <p className="text-white/50 text-xs mt-1">
            Rankings update hourly based on vault performance. Observers appear when they have not met eligibility.
          </p>
        </div>
        {renderFilters()}
      </div>

      {loading ? (
        <div className="px-4 py-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-12 rounded-md bg-white/10" />
          ))}
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-sm text-red-400">{error}</div>
      ) : rankedRows.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-white/60">
          No ranked members yet. Invite friends or deposit to qualify.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {!isMobile && (
            <div className="grid grid-cols-[60px_1fr_repeat(4,minmax(0,1fr))] gap-3 px-4 py-2 text-[11px] uppercase tracking-wide text-white/40">
              <span>Rank</span>
              <span>Alias</span>
              <span>Deposit</span>
              <span>PnL USD</span>
              <span>PnL %</span>
              <span>NDLP</span>
              <span className="text-right">Updated</span>
            </div>
          )}
          {rankedRows.map((row) =>
            isMobile ? renderRowMobile(row) : renderRowDesktop(row)
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10 text-xs text-white/50">
        <span>
          Updated {latestUpdate ? relativeTime(latestUpdate) : "--"}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white/80 hover:text-white hover:border-white/40"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
};

export default Scoreboard;
