import {
  useVaultPerformanceSummary,
  useVaultPerformanceDistribution,
  useVaultPerformanceLeaderboard,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatAmount } from "@/lib/utils";

type UserPerformanceComparisonProps = {
  vaultId?: string;
};

const formatUsd = (value: number, minimumFractionDigits = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(value);
};

const formatPercent = (value: number, precision = 2) => {
  return `${formatAmount({
    amount: value * 100,
    precision,
    stripZero: false,
  })}%`;
};

const formatShortPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const PERFORMANCE_TOOLTIP = `
PnL reflects both realized and unrealized outcomes. Rebalancing events can realize impermanent loss, which will show up in your PnL.
`;

const histogramConfig = {
  count: {
    label: "Vault peers",
    color: "hsl(220 70% 55%)",
  },
};

const extractCohortSize = (
  summary?: { cohortSize: number },
  distribution?: { cohortSize: number },
  leaderboard?: { cohortSize: number }
) => {
  return (
    summary?.cohortSize ||
    distribution?.cohortSize ||
    leaderboard?.cohortSize ||
    0
  );
};

const usePinnedRows = (rows: VaultPerformanceLeaderboardRow[], search: string) => {
  return useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? rows.filter((row) =>
          row.alias.toLowerCase().includes(term)
        )
      : rows;

    const yourRow = filtered.find((row) => row.isYou);
    const others = filtered.filter((row) => !row.isYou);

    return yourRow ? [yourRow, ...others] : filtered;
  }, [rows, search]);
};

const NotEnoughPeers = () => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-white/30 bg-white/5 px-4 text-center">
    <p className="text-base font-semibold text-white">
      Not enough peers yet
    </p>
    <p className="mt-1 text-sm text-white/60 max-w-md">
      We will surface distribution and leaderboard insights once at least{" "}
      {MIN_PERFORMANCE_COHORT} vault users are active in this cohort.
    </p>
  </div>
);

const LoadingPlaceholder = ({
  lines = 4,
}: {
  lines?: number;
}) => (
  <div className="flex h-full min-h-[220px] flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-4 md:p-5">
    <div className="space-y-3">
      <div className="h-5 w-1/3 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-2/5 animate-pulse rounded bg-white/10" />
    </div>
    <div className="mt-6 space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 w-full animate-pulse rounded bg-white/10"
        />
      ))}
    </div>
  </div>
);

const SummaryMetric = ({
  label,
  value,
  sublabel,
  emphasize,
}: {
  label: string;
  value: string;
  sublabel?: string;
  emphasize?: boolean;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
    <p
      className={cn(
        "mt-1 text-lg font-semibold text-white",
        emphasize && "text-2xl md:text-3xl"
      )}
    >
      {value}
    </p>
    {sublabel && (
      <p className="text-sm text-white/60">{sublabel}</p>
    )}
  </div>
);

const SummaryStrip = ({
  pnlUsd,
  pnlPct,
  depositsUsd,
  withdrawalsUsd,
  currentValueUsd,
  context,
}: {
  pnlUsd: number;
  pnlPct: number;
  depositsUsd: number;
  withdrawalsUsd: number;
  currentValueUsd: number;
  context?: {
    utilizationRate?: number;
    feesRewards24h?: number;
  };
}) => {
  const pnlPositive = pnlUsd >= 0;
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">
              Your PnL
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold",
                pnlPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatUsd(pnlUsd)}
            </p>
            <p
              className={cn(
                "text-sm font-medium",
                pnlPositive ? "text-emerald-300" : "text-red-300"
              )}
            >
              {formatPercent(pnlPct)}
            </p>
          </div>
          {context && (
            <div className="flex flex-col items-end gap-2 text-right">
              {typeof context.utilizationRate === "number" && (
                <Badge variant="emerald" className="bg-emerald/20">
                  Utilization {formatShortPercent(context.utilizationRate)}
                </Badge>
              )}
              {typeof context.feesRewards24h === "number" && (
                <Badge variant="nova" className="bg-nova/20">
                  24h Fees/Rewards {formatUsd(context.feesRewards24h, 0)}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryMetric
            label="Total deposits"
            value={formatUsd(depositsUsd)}
          />
          <SummaryMetric
            label="Current value"
            value={formatUsd(currentValueUsd)}
          />
          <SummaryMetric
            label="Total withdrawals"
            value={formatUsd(withdrawalsUsd)}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-white/60">
        PnL computed from deposits/withdrawals + current NDLP value.
      </p>
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

  return (
    <div className="flex h-full flex-col rounded-lg border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-white">
            Vault PnL% distribution
          </p>
          <p className="text-sm text-white/60">
            {bins.length} bins across cohort PnL%
          </p>
        </div>
        <Badge variant="secondary" className="bg-white/10 text-white">
          You are at the {percentile} percentile
        </Badge>
      </div>
      <div className="mt-4 flex-1">
        <ChartContainer
          config={histogramConfig}
          className="h-[220px] w-full"
        >
          <BarChart data={chartData}>
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
              x={yourValue * 100}
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="6 2"
              label={{
                value: "You",
                position: "insideTop",
                fill: "#f3f4f6",
                fontSize: 12,
              }}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

const LeaderboardCard = ({
  rows,
  loading,
  searchTerm,
  onSearch,
  cohortSize,
}: {
  rows: VaultPerformanceLeaderboardRow[];
  loading: boolean;
  searchTerm: string;
  onSearch: (value: string) => void;
  cohortSize: number;
}) => {
  const dataset = usePinnedRows(rows, searchTerm);
  const yourRow = useMemo(
    () => rows.find((row) => row.isYou),
    [rows]
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-white">
            Anonymous leaderboard
          </p>
          <p className="text-sm text-white/60">
            Ranked by PnL%. Cohort size: {cohortSize}
          </p>
        </div>
        <div className="w-full md:w-[240px]">
          <Input
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search alias"
            className="h-10 rounded-md border border-white/20 bg-black/60 text-sm text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/70"
          />
        </div>
      </div>
      {yourRow && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-white">
          <div>
            <span className="text-white/70">Your alias:</span>{" "}
            <span className="font-mono font-semibold text-white">
              {yourRow.alias}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-100">
              Rank {yourRow.rank}
            </Badge>
            <span className="text-white/70">
              PnL {formatPercent(yourRow.pnlPct)}
            </span>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Table className="min-w-full text-sm">
          <TableHeader className="sticky top-0 z-10 backdrop-blur">
            <TableRow className="border-white/10">
              <TableHead className="w-14 text-white/70">Rank</TableHead>
              <TableHead className="text-white/70">Alias</TableHead>
              <TableHead className="text-white/70">PnL %</TableHead>
              <TableHead className="text-white/70">PnL USD</TableHead>
              <TableHead className="text-white/70">Deposits</TableHead>
              <TableHead className="text-white/70">Withdrawals</TableHead>
              <TableHead className="text-white/70">Current value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse border-white/5">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full rounded bg-white/10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : dataset.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-white/60">
                  {searchTerm
                    ? "No peers match that alias yet."
                    : "Leaderboard data will appear as soon as peers have activity."}
                </TableCell>
              </TableRow>
            ) : (
              dataset.map((row) => (
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
                  <TableCell
                    className={cn(
                      "font-mono",
                      row.pnlPct >= 0
                        ? "text-emerald-300"
                        : "text-red-300"
                    )}
                  >
                    {formatPercent(row.pnlPct)}
                  </TableCell>
                  <TableCell className="font-mono text-white/80">
                    {formatUsd(row.pnlUsd)}
                  </TableCell>
                  <TableCell className="font-mono text-white/80">
                    {formatUsd(row.depositsUsd)}
                  </TableCell>
                  <TableCell className="font-mono text-white/80">
                    {formatUsd(row.withdrawalsUsd)}
                  </TableCell>
                  <TableCell className="font-mono text-white/80">
                    {formatUsd(row.currentValueUsd)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const ContextFooter = ({
  apr24h,
  apr7d,
  apy7d,
}: {
  apr24h: number;
  apr7d: number;
  apy7d: number;
}) => (
  <div className="flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-black/60 p-4 text-sm">
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">
        24h rolling APR
      </p>
      <p className="text-base font-semibold text-white">
        {formatPercent(apr24h)}
      </p>
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">
        7-day average APR
      </p>
      <p className="text-base font-semibold text-white">
        {formatPercent(apr7d)}
      </p>
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">
        7-day APY
      </p>
      <p className="text-base font-semibold text-white">
        {formatPercent(apy7d)}
      </p>
    </div>
  </div>
);

const UserPerformanceComparison = ({ vaultId }: UserPerformanceComparisonProps) => {
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
    data: leaderboard,
    isLoading: leaderboardLoading,
  } = useVaultPerformanceLeaderboard(vaultId, { sort: "pnlPct", limit: 100 });

  const cohortSize = extractCohortSize(summary, distribution, leaderboard);
  const insufficientPeers =
    cohortSize > 0 && cohortSize < MIN_PERFORMANCE_COHORT;
  const [searchTerm, setSearchTerm] = useState("");

  if (summaryError) {
    return (
      <DetailWrapper
        title="Your performance"
        isLoading={false}
      >
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
      titleComponent={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 rounded-md border border-white/20 bg-black/40 px-3 py-1 text-sm text-white/80 hover:bg-black/60">
              <Info className="h-4 w-4" />
              Methodology
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-black/90 text-white">
              {PERFORMANCE_TOOLTIP.trim()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      {summary ? (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <SummaryStrip
              pnlUsd={summary.your.pnlUsd}
              pnlPct={summary.your.pnlPct}
              depositsUsd={summary.your.depositsUsd}
              withdrawalsUsd={summary.your.withdrawalsUsd}
              currentValueUsd={summary.your.currentValueUsd}
              context={summary.context}
            />
            {insufficientPeers ? (
              <NotEnoughPeers />
            ) : distribution ? (
              <DistributionCard
                bins={distribution.bins}
                yourValue={distribution.your.value}
                percentile={distribution.your.percentile}
              />
            ) : (
              <LoadingPlaceholder />
            )}
          </div>
          {insufficientPeers ? (
            <NotEnoughPeers />
          ) : (
            <LeaderboardCard
              rows={leaderboard?.rows ?? []}
              loading={leaderboardLoading && !leaderboard}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              cohortSize={cohortSize}
            />
          )}
          <ContextFooter
            apr24h={summary.context.apr24h}
            apr7d={summary.context.apr7d}
            apy7d={summary.context.apy7d}
          />
        </div>
      ) : (
        <div className="min-h-[220px]" />
      )}
    </DetailWrapper>
  );
};

export default UserPerformanceComparison;
