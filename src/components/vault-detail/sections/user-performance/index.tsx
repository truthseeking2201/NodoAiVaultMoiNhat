import { useEffect, useMemo, useState } from "react";
import {
  useVaultPerformanceSummary,
  useVaultPerformanceDistribution,
  useVaultPerformancePeers,
} from "@/hooks";
import {
  MIN_PERFORMANCE_COHORT,
  VaultPerformanceLeaderboardRow,
} from "@/types/vault-performance";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatAmount } from "@/lib/utils";
import { CustomPagination } from "@/components/ui/custom-pagination";

type UserPerformanceComparisonProps = {
  vaultId?: string;
};

const PAGE_SIZE = 20;

const histogramConfig = {
  count: {
    label: "Vault peers",
    color: "hsl(220 70% 55%)",
  },
};

const formatUsd = (value: number, fractionDigits = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

const formatPercent = (value: number, precision = 2) =>
  `${formatAmount({
    amount: value * 100,
    precision,
    stripZero: false,
  })}%`;

const formatShortPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

const extractCohortSize = (
  distribution?: { cohortSize: number },
  peers?: { cohortSize: number }
) => {
  return peers?.cohortSize || distribution?.cohortSize || 0;
};

const NotEnoughPeers = () => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#121317] px-4 text-center">
    <p className="text-base font-semibold text-white">Not enough peers yet</p>
    <p className="mt-1 text-sm text-white/60 max-w-md">
      We will surface distribution and peer metrics once at least{" "}
      {MIN_PERFORMANCE_COHORT} vault users are active in this cohort.
    </p>
  </div>
);

const SummaryCard = ({
  pnlUsd,
  pnlPct,
  depositsUsd,
  utilization,
  feesRewards24hUsd,
  percentile,
  className,
}: {
  pnlUsd: number;
  pnlPct: number;
  depositsUsd: number;
  utilization: number;
  feesRewards24hUsd: number;
  percentile: number;
  className?: string;
}) => {
  const safeUtilization = Number.isFinite(utilization) ? utilization : 0;
  const safeFees = Number.isFinite(feesRewards24hUsd)
    ? feesRewards24hUsd
    : 0;
  const aheadPercent = Math.round(percentile * 100);
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#121317] p-4 md:p-6",
        className
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white/80">Your PnL (USD)</p>
          <p
            className={cn(
              "mt-1 text-4xl font-semibold",
              pnlUsd >= 0 ? "text-emerald-300" : "text-red-300"
            )}
          >
            {formatUsd(pnlUsd)}
          </p>
          <p
            className={cn(
              "mt-2 text-sm font-semibold",
              pnlPct >= 0 ? "text-emerald-300" : "text-red-300"
            )}
          >
            Your PnL (%): {formatPercent(pnlPct)}
          </p>
          <p className="mt-3 text-sm text-white/70">
            You’re ahead of {aheadPercent}% of peers
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="-mt-[2px]"
            >
              <path
                d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                fill="currentColor"
              />
            </svg>
            24h Fees/Rewards {formatUsd(safeFees, 0)}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
            Utilization {(safeUtilization * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-white/60">
          Total deposits
        </p>
        <p className="mt-1 text-xl font-semibold text-white">
          {formatUsd(depositsUsd)}
        </p>
      </div>
    </div>
  );
};

const DistributionCard = ({
  bins,
  yourValue,
  percentile,
  className,
}: {
  bins: { x0: number; x1: number; count: number }[];
  yourValue: number;
  percentile: number;
  className?: string;
}) => {
  const chartData = useMemo(
    () =>
      bins.map((bin, index) => ({
        bucket: index,
        midpoint: ((bin.x0 + bin.x1) / 2) * 100,
        count: bin.count,
        label: `${formatShortPercent(bin.x0)} to ${formatShortPercent(bin.x1)}`,
      })),
    [bins]
  );
  const normalizedPercentile = Number.isFinite(percentile) ? percentile : 0;
  const aheadPercent =
    normalizedPercentile > 1
      ? Math.round(normalizedPercentile)
      : Math.round(normalizedPercentile * 100);
  const userMarker = (yourValue ?? 0) * 100;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-white/10 bg-[#121317] p-4 md:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">
            Peers by PnL% (last 90 days)
          </p>
          <p className="text-sm text-white/60">
            30 buckets; each bar shows how many users fall into that return range.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
          You’re ahead of {aheadPercent}% of peers
        </span>
      </div>
      <div className="mt-6 flex-1">
        <ChartContainer
          config={histogramConfig}
          className="h-[320px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 32, bottom: 20, left: 48 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="midpoint"
              type="number"
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              label={{
                value: "PnL %",
                position: "insideBottomRight",
                offset: -8,
                fill: "rgba(255,255,255,0.6)",
              }}
            />
            <YAxis
              allowDecimals={false}
              width={40}
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              label={{
                value: "Users",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: "rgba(255,255,255,0.6)",
              }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.08)" }}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/70">
                        {item.payload.label}
                      </span>
                      <span className="font-mono text-white">
                        {value as number} users
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="rgba(80, 156, 255, 0.9)"
              radius={[4, 4, 0, 0]}
            />
            <ReferenceLine
              x={userMarker}
              stroke="#60A5FA"
              strokeWidth={2}
              label={{
                value: "You",
                position: "top",
                fill: "#93c5fd",
                fontSize: 12,
              }}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

const PeerTable = ({
  rows,
  total,
  cohortSize,
  you,
  page,
  onPageChange,
  isLoading,
}: {
  rows: VaultPerformanceLeaderboardRow[];
  total: number;
  cohortSize: number;
  you?: {
    rank: number;
    alias: string;
    pnlPct: number;
    pnlUsd: number;
    depositsUsd: number;
  };
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) => {
  const totalPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
  const currentPage = Math.min(totalPages, Math.max(1, page + 1));

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-white">
            Peer Comparison (Anonymous)
          </p>
          <p className="text-sm text-white/60">
            Cohort size: {cohortSize}. Showing {PAGE_SIZE} per page.
          </p>
        </div>
      </div>
      {you && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-white">
          <div>
            <span className="text-white/70">Your alias:</span>{" "}
            <span className="font-mono font-semibold text-white">
              {you.alias}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-100">
              Rank {you.rank}
            </Badge>
            <span className="text-white/70">
              PnL {formatPercent(you.pnlPct)}
            </span>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Table className="min-w-full text-sm">
          <TableHeader className="sticky top-0 z-10 backdrop-blur">
            <TableRow className="border-white/10">
              <TableHead className="w-14 text-white/70">#</TableHead>
              <TableHead className="text-white/70">Alias</TableHead>
              <TableHead className="text-right text-white/70">
                Deposits (USD)
              </TableHead>
              <TableHead className="text-right text-white/70">PnL %</TableHead>
              <TableHead className="text-right text-white/70">PnL (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableRow key={index} className="animate-pulse border-white/5">
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full rounded bg-white/10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-white/60">
                  No peer data available yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={`${row.rank}-${row.alias}`}
                  className={cn(
                    "border-white/5",
                    row.isYou && "border-l-4 border-l-emerald-400 bg-emerald-500/10"
                  )}
                >
                  <TableCell className="font-mono text-sm text-white/80">
                    {row.rank}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {row.alias}
                    {row.isYou && (
                      <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
                        You
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-right text-white/80">
                    {formatUsd(row.depositsUsd, 0)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono text-right",
                      row.pnlPct >= 0 ? "text-emerald-300" : "text-red-300"
                    )}
                  >
                    {formatPercent(row.pnlPct)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono text-right",
                      row.pnlUsd >= 0 ? "text-emerald-300" : "text-red-300"
                    )}
                  >
                    {formatUsd(row.pnlUsd, 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-end">
        <CustomPagination
          itemsPerPage={PAGE_SIZE}
          totalItems={total}
          currentPage={currentPage}
          handlePageChange={(nextPage) => {
            if (!isLoading) {
              onPageChange(Math.max(0, nextPage - 1));
            }
          }}
          displayTotalPages={totalPages}
          isShowingTotalPages={false}
        />
      </div>
    </div>
  );
};

const UserPerformanceComparison = ({ vaultId }: UserPerformanceComparisonProps) => {
  const [page, setPage] = useState(0);

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorMessage,
  } = useVaultPerformanceSummary(vaultId);
  const {
    data: distribution,
  } = useVaultPerformanceDistribution(vaultId);
  const {
    data: peersData,
    isLoading: peersLoading,
  } = useVaultPerformancePeers(vaultId, {
    sort: "pnlPct",
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  useEffect(() => {
    if (page === 0 || !peersData) {
      return;
    }
    if (page * PAGE_SIZE >= (peersData.total || 0)) {
      setPage(0);
    }
  }, [page, peersData]);

  const cohortSize = extractCohortSize(distribution, peersData);
  const insufficientPeers =
    cohortSize > 0 && cohortSize < MIN_PERFORMANCE_COHORT;

  if (summaryError) {
    return (
      <DetailWrapper title="Your performance" isLoading={false}>
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-sm text-white/70">
          <p>
            We could not load your performance.{" "}
            {summaryErrorMessage?.message ?? ""}
          </p>
        </div>
      </DetailWrapper>
    );
  }

  return (
    <DetailWrapper
      title="Your performance"
      isLoading={summaryLoading && !summary}
    >
      {summary ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-7">
              <SummaryCard
                pnlUsd={summary.your.pnlUsd}
                pnlPct={summary.your.pnlPct}
                depositsUsd={summary.your.depositsUsd}
                utilization={summary.context.utilization}
                feesRewards24hUsd={summary.context.feesRewards24hUsd}
                percentile={summary.peer.percentilePnLPct ?? 0}
                className="h-full"
              />
            </div>
            <div className="lg:col-span-5">
              {insufficientPeers || !distribution ? (
                <div className="h-full">
                  <NotEnoughPeers />
                </div>
              ) : (
                <DistributionCard
                  bins={distribution.bins}
                  yourValue={distribution.your.value}
                  percentile={distribution.your.percentile}
                  className="h-full"
                />
              )}
            </div>
          </section>

          {insufficientPeers || !peersData ? (
            <NotEnoughPeers />
          ) : (
            <PeerTable
              rows={peersData.rows}
              total={peersData.total}
              cohortSize={peersData.cohortSize}
              you={peersData.you}
              page={page}
              onPageChange={setPage}
              isLoading={peersLoading}
            />
          )}
        </div>
      ) : (
        <div className="min-h-[220px]" />
      )}
    </DetailWrapper>
  );
};

export default UserPerformanceComparison;
