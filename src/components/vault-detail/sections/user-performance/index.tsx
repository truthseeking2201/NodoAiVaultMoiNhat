import { useEffect, useMemo, useRef, useState } from "react";
import {
  useVaultPerformanceSummary,
  useVaultPerformanceDistribution,
  useVaultPerformancePeers,
} from "@/hooks";
import {
  MIN_PERFORMANCE_COHORT,
  VaultPerformanceDistributionResponse,
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

const DISTRIBUTION_WINDOWS: VaultPerformanceDistributionResponse["window"][] = [
  "all",
  "1d",
  "1w",
];

const WINDOW_LABELS: Record<
  VaultPerformanceDistributionResponse["window"],
  string
> = {
  all: "All",
  "1d": "1D",
  "1w": "1W",
};

const formatUsd = (value: number, fractionDigits = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

const formatUsdShort = (value: number) => {
  if (!Number.isFinite(value)) {
    return "$0";
  }
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  }
  if (abs >= 1) {
    return `${sign}$${abs.toFixed(0)}`;
  }
  return `${sign}$${abs.toFixed(2)}`;
};

const formatUsdRangeLabel = (x0: number, x1: number) => {
  const precisionStart = Math.abs(x0) < 1 ? 2 : 0;
  const precisionEnd = Math.abs(x1) < 1 ? 2 : 0;
  return `${formatUsd(x0, precisionStart)} to ${formatUsd(
    x1,
    precisionEnd
  )}`;
};

const formatPercent = (value: number, precision = 2) =>
  `${formatAmount({
    amount: value * 100,
    precision,
    stripZero: false,
  })}%`;

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
  depositsUsd,
}: {
  pnlUsd: number;
  depositsUsd: number;
}) => {
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
        </div>

        <div className="text-right">
          <div className="text-white/60 text-xs">Total deposits</div>
          <div className="mt-1 text-4xl font-bold text-white">
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
  window,
  onWindowChange,
  peersSize,
}: {
  bins: { x0: number; x1: number; count: number }[];
  yourValue: number | null | undefined;
  percentile: number | null | undefined;
  window: VaultPerformanceDistributionResponse["window"];
  onWindowChange: (
    value: VaultPerformanceDistributionResponse["window"]
  ) => void;
  peersSize: number;
}) => {
  const chartData = useMemo(
    () =>
      bins.map((bin) => ({
        midpoint: (bin.x0 + bin.x1) / 2,
        count: bin.count,
        label: formatUsdRangeLabel(bin.x0, bin.x1),
      })),
    [bins]
  );

  const hasValues = chartData.length > 0;
  const xValues = chartData.map((item) => item.midpoint);
  const xMin = hasValues ? Math.min(...xValues) : 0;
  const xMax = hasValues ? Math.max(...xValues) : 0;
  const pad = hasValues ? Math.max(1, (xMax - xMin) * 0.08) : 1;
  const domain: [number, number] = [xMin - pad, xMax + pad];

  const normalizedPercentile = Math.max(
    0,
    Math.min(1, Number.isFinite(percentile) ? (percentile as number) : 0)
  );
  const aheadPercent = Number.isFinite(percentile)
    ? Math.round(normalizedPercentile * 100)
    : null;
  const youMarker =
    yourValue != null && Number.isFinite(yourValue)
      ? (yourValue as number)
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121317] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">
            Peers by PnL ($)
          </p>
          <p className="mt-1 text-xs text-white/60">
            Each bar shows how many users fall into that gain/loss range.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
            {DISTRIBUTION_WINDOWS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onWindowChange(value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  window === value
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10"
                )}
              >
                {WINDOW_LABELS[value]}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/50">
            {peersSize.toLocaleString("en-US")} peers
          </span>
        </div>
      </div>
      {aheadPercent != null && (
        <p className="mt-3 text-xs text-white/60">
          You’re ahead of {aheadPercent}% of peers for this window.
        </p>
      )}
      <div className="mt-3 h-[360px] w-full">
        <ChartContainer config={histogramConfig} className="h-full w-full">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 24, bottom: 28, left: 54 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="midpoint"
              type="number"
              domain={hasValues ? domain : undefined}
              tickFormatter={(value) => formatUsdShort(value)}
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              label={{
                value: "PnL ($)",
                position: "insideBottomRight",
                offset: -8,
                fill: "rgba(255,255,255,0.6)",
              }}
            />
            <YAxis
              allowDecimals={false}
              width={42}
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              label={{
                value: "Users",
                angle: -90,
                position: "insideLeft",
                offset: 12,
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
            {youMarker != null && (
              <ReferenceLine
                x={youMarker}
                stroke="#60A5FA"
                strokeWidth={2}
                label={{
                  value: "You",
                  position: "top",
                  fill: "#93c5fd",
                  fontSize: 12,
                }}
              />
            )}
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
      <div className="mt-4 overflow-x-auto">
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
  const [distributionWindow, setDistributionWindow] =
    useState<VaultPerformanceDistributionResponse["window"]>("all");

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorMessage,
  } = useVaultPerformanceSummary(vaultId);
  const {
    data: distribution,
  } = useVaultPerformanceDistribution(vaultId, {
    window: distributionWindow,
  });
  const {
    data: peersData,
    isLoading: peersLoading,
  } = useVaultPerformancePeers(vaultId, {
    sort: "pnlPct",
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  useEffect(() => {
    setDistributionWindow("all");
  }, [vaultId]);

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
              depositsUsd={summary.your.depositsUsd}
            />
            {insufficientPeers || !distribution ? (
              <NotEnoughPeers />
            ) : (
              <DistributionCard
                bins={distribution.bins}
                yourValue={distribution.your.value}
                percentile={distribution.your.percentile}
                window={distributionWindow}
                onWindowChange={setDistributionWindow}
                peersSize={distribution.peers.size}
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
