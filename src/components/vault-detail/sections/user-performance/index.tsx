import { useEffect, useMemo, useRef, useState } from "react";
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
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#121317] p-5 text-center">
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
  percentile,
}: {
  pnlUsd: number;
  pnlPct: number;
  depositsUsd: number;
  percentile: number;
}) => {
  const aheadPercent = Math.round(percentile * 100);
  const pnlUsdDisplay = formatUsd(pnlUsd);
  const depositsDisplay = formatUsd(depositsUsd);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121317] p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-white/90 font-semibold">Your PnL (USD)</div>
          <div
            className={cn(
              "mt-1 text-4xl font-bold",
              pnlUsd >= 0 ? "text-emerald-300" : "text-red-300"
            )}
          >
            {pnlUsdDisplay}
          </div>
          <div className="mt-1 text-sm">
            <span
              className={cn(
                "font-medium",
                pnlPct >= 0 ? "text-emerald-300" : "text-red-300"
              )}
            >
              Your PnL (%): {formatPercent(pnlPct)}
            </span>
            <span className="ml-3 text-white/60">
              • You’re ahead of {aheadPercent}% of peers
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-white/60 text-xs">Total deposits</div>
          <div className="text-white text-xl font-semibold">
            {depositsDisplay}
          </div>
        </div>
      </div>
    </div>
  );
};

const DistributionCard = ({
  bins,
  yourValue,
  percentile,
}: {
  bins: { x0: number; x1: number; count: number }[];
  yourValue: number;
  percentile: number;
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
    <div className="rounded-2xl border border-white/10 bg-[#121317] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">
            Peers by PnL% (last 90 days)
          </p>
          <p className="text-xs text-white/60 mt-1">
            Each bar shows how many users fall into that return range.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
          You’re ahead of {aheadPercent}% of peers
        </span>
      </div>
      <div className="mt-3 w-full h-[360px]">
        <ChartContainer config={histogramConfig} className="h-full w-full">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 32, bottom: 28, left: 48 }}
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
  const youRank = you?.rank;
  const [pendingScroll, setPendingScroll] = useState(false);
  const [flashYouRow, setFlashYouRow] = useState(false);
  const flashTimeoutRef = useRef<number>();

  const scrollToYouRow = () => {
    const node = document.querySelector<HTMLElement>("[data-you-row='true']");
    if (!node) {
      return false;
    }
    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setFlashYouRow(true);
    window.clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = window.setTimeout(
      () => setFlashYouRow(false),
      1500
    );
    return true;
  };

  const handleFindMe = () => {
    if (!youRank) {
      return;
    }
    const targetPage = Math.max(0, Math.floor((youRank - 1) / PAGE_SIZE));
    if (targetPage !== page) {
      setPendingScroll(true);
      onPageChange(targetPage);
    } else {
      const scrolled = scrollToYouRow();
      if (!scrolled) {
        setPendingScroll(true);
      }
    }
  };

  useEffect(() => {
    if (!pendingScroll) {
      return;
    }
    const hasYouRow = rows.some((row) => row.isYou);
    if (!hasYouRow) {
      return;
    }
    if (scrollToYouRow()) {
      setPendingScroll(false);
    }
  }, [rows, pendingScroll]);

  useEffect(() => {
    return () => {
      window.clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121317] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">Peer Comparison</div>
        <button
          onClick={handleFindMe}
          className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition-colors"
        >
          Find me
        </button>
      </div>
      <div className="text-white/60 text-xs mb-3">{total} peers</div>
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
              <TableHead className="text-right text-white/70">
                PnL (USD)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableRow key={index} className="animate-pulse border-white/5">
                  {Array.from({ length: 4 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full rounded bg-white/10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-white/60">
                  No peer data available yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={`${row.rank}-${row.alias}`}
                  data-you-row={row.isYou ? "true" : undefined}
                  className={cn(
                    "border-white/5 transition-shadow",
                    row.isYou &&
                      "border-l-4 border-l-emerald-400 bg-emerald-500/10",
                    row.isYou && flashYouRow && "shadow-[0_0_0_2px_rgba(99,102,241,0.4)]"
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
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-white/60 text-xs">
          {PAGE_SIZE} per page
        </div>
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
          <section className="grid grid-cols-1 gap-6">
            <SummaryCard
              pnlUsd={summary.your.pnlUsd}
              pnlPct={summary.your.pnlPct}
              depositsUsd={summary.your.depositsUsd}
              percentile={summary.peer.percentilePnLPct ?? 0}
            />
            {insufficientPeers || !distribution ? (
              <NotEnoughPeers />
            ) : (
              <DistributionCard
                bins={distribution.bins}
                yourValue={distribution.your.value}
                percentile={distribution.your.percentile}
              />
            )}
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
