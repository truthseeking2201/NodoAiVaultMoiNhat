export type SafetyTier = "SAFE" | "CAUTIOUS" | "WAIT" | "AVOID";

export interface SafetyScoreComponent {
  key: "trend" | "volatility" | "rsi" | "liquidity" | "sentiment";
  label: string;
  value: number;
  tooltip: string;
}

export interface SafetyScoreSnapshot {
  vaultId: string;
  score: number;
  tier: SafetyTier;
  freshnessMinutes: number;
  updatedAt: string;
  components: SafetyScoreComponent[];
}

export interface SafetyScoreHistoryPoint {
  timestamp: string;
  score: number;
}

export interface SafetyVaultState {
  vaultId: string;
  tvlUsd: number;
  cooldownHours: number;
  largeDepositThresholdPct: number;
  minimumScoreForLargeDeposit: number;
  autoPauseBelowScore: number;
}

export interface SafetyAgentEvent {
  id: string;
  type: "MODEL_ALERT" | "POLICY_UPDATE" | "MANUAL_OVERRIDE" | "VOLATILITY";
  timestamp: string;
  detail?: string;
  impact: "positive" | "neutral" | "negative";
}

export const tierTheme: Record<
  SafetyTier,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  SAFE: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-400/20",
    dot: "bg-emerald-400",
  },
  CAUTIOUS: {
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    border: "border-amber-400/20",
    dot: "bg-amber-400",
  },
  WAIT: {
    bg: "bg-orange-500/10",
    text: "text-orange-200",
    border: "border-orange-400/20",
    dot: "bg-orange-400",
  },
  AVOID: {
    bg: "bg-red-500/10",
    text: "text-red-200",
    border: "border-red-400/20",
    dot: "bg-red-400",
  },
};

export const tierCopy: Record<
  SafetyTier,
  {
    title: string;
    desc: string;
  }
> = {
  SAFE: {
    title: "Favorable range; standard execution.",
    desc: "Favorable conditions — normal position sizing.",
  },
  CAUTIOUS: {
    title: "Heightened risk; adjust sizing and cadence.",
    desc: "Reduce size 25–50% and extend DCA timeline.",
  },
  WAIT: {
    title: "System evaluating new data; pause entries.",
    desc: "Pause new entries; system will re-check in ~6 hours.",
  },
  AVOID: {
    title: "Critical instability detected; halt flows.",
    desc: "Halt all operations until conditions improve.",
  },
};

export const mockSafetyScore: SafetyScoreSnapshot = {
  vaultId: "NODO-VLT-42",
  score: 78.4,
  tier: "SAFE",
  freshnessMinutes: 38,
  updatedAt: new Date().toISOString(),
  components: [
    {
      key: "trend",
      label: "Trend Momentum",
      value: 84,
      tooltip: "Momentum and direction of the vault's strategy trend over the past 48h.",
    },
    {
      key: "volatility",
      label: "Volatility",
      value: 68,
      tooltip: "Rolling 7d volatility relative to policy band.",
    },
    {
      key: "rsi",
      label: "RSI",
      value: 74,
      tooltip: "Risk stability index capturing internal health signals.",
    },
    {
      key: "liquidity",
      label: "Liquidity",
      value: 81,
      tooltip: "Depth and slippage tolerance against expected order sizes.",
    },
    {
      key: "sentiment",
      label: "Sentiment",
      value: 63,
      tooltip: "Aggregated news and onchain positioning sentiment feeds.",
    },
  ],
};

export const mockScoreHistory: SafetyScoreHistoryPoint[] = [
  { timestamp: "2024-01-10T08:00:00Z", score: 62 },
  { timestamp: "2024-01-11T08:00:00Z", score: 64 },
  { timestamp: "2024-01-12T08:00:00Z", score: 66 },
  { timestamp: "2024-01-13T08:00:00Z", score: 59 },
  { timestamp: "2024-01-14T08:00:00Z", score: 54 },
  { timestamp: "2024-01-15T08:00:00Z", score: 48 },
  { timestamp: "2024-01-16T08:00:00Z", score: 52 },
  { timestamp: "2024-01-17T08:00:00Z", score: 56 },
  { timestamp: "2024-01-18T08:00:00Z", score: 61 },
  { timestamp: "2024-01-19T08:00:00Z", score: 68 },
  { timestamp: "2024-01-20T08:00:00Z", score: 72 },
  { timestamp: "2024-01-21T08:00:00Z", score: 75 },
  { timestamp: "2024-01-22T08:00:00Z", score: 77 },
  { timestamp: "2024-01-23T08:00:00Z", score: 78 },
  { timestamp: "2024-01-24T08:00:00Z", score: 74 },
  { timestamp: "2024-01-25T08:00:00Z", score: 70 },
  { timestamp: "2024-01-26T08:00:00Z", score: 68 },
  { timestamp: "2024-01-27T08:00:00Z", score: 71 },
  { timestamp: "2024-01-28T08:00:00Z", score: 73 },
  { timestamp: "2024-01-29T08:00:00Z", score: 78 },
  { timestamp: "2024-01-30T08:00:00Z", score: 81 },
  { timestamp: "2024-01-31T08:00:00Z", score: 84 },
  { timestamp: "2024-02-01T08:00:00Z", score: 79 },
  { timestamp: "2024-02-02T08:00:00Z", score: 76 },
  { timestamp: "2024-02-03T08:00:00Z", score: 72 },
  { timestamp: "2024-02-04T08:00:00Z", score: 74 },
  { timestamp: "2024-02-05T08:00:00Z", score: 77 },
  { timestamp: "2024-02-06T08:00:00Z", score: 79 },
  { timestamp: "2024-02-07T08:00:00Z", score: 78 },
];

export const mockVaultState: SafetyVaultState = {
  vaultId: "NODO-VLT-42",
  tvlUsd: 108_250_000,
  cooldownHours: 6,
  largeDepositThresholdPct: 12,
  minimumScoreForLargeDeposit: 70,
  autoPauseBelowScore: 65,
};

export const mockAgentEvents: SafetyAgentEvent[] = [
  {
    id: "evt-01",
    type: "MODEL_ALERT",
    timestamp: "2024-01-15T12:30:00Z",
    detail: "Model flagged elevated short-term volatility; automated de-risk actions executed.",
    impact: "negative",
  },
  {
    id: "evt-02",
    type: "POLICY_UPDATE",
    timestamp: "2024-01-19T09:10:00Z",
    detail: "Collateral requirement increased by 5% following committee review.",
    impact: "neutral",
  },
  {
    id: "evt-03",
    type: "MANUAL_OVERRIDE",
    timestamp: "2024-01-22T18:45:00Z",
    detail: "Head of trading approved conditional re-entry after volatility normalization.",
    impact: "positive",
  },
  {
    id: "evt-04",
    type: "VOLATILITY",
    timestamp: "2024-01-31T04:20:00Z",
    detail: "Asia session liquidity crunch observed; hedges extended.",
    impact: "neutral",
  },
];

