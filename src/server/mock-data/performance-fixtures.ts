import {
  PerformanceDistributionBin,
  PerformanceMetricBreakdown,
} from "@/types/vault-performance";

type RawPerformancePeer = {
  wallet: string;
  metrics: PerformanceMetricBreakdown;
};

type PerformanceDataset = {
  peers: RawPerformancePeer[];
  bins: PerformanceDistributionBin[];
  cohortSize: number;
  yourWallet: string;
  context: {
    apr24h: number;
    apr7d: number;
    apy7d: number;
    utilizationRate: number;
    feesRewards24h: number;
  };
};

const BIN_COUNT = 30;
const BIN_MIN = -0.2;
const BIN_WIDTH = 0.021;

const TARGET_BIN_COUNTS: number[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 12,
  14, 16, 12, 10, 8, 7, 6, 5, 4, 3,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
];

const roundTo = (value: number, precision: number) =>
  Number(value.toFixed(precision));

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const getBinIndex = (value: number) => {
  const index = Math.floor((value - BIN_MIN) / BIN_WIDTH);
  return Math.max(0, Math.min(BIN_COUNT - 1, index));
};

const buildBins = (peers: RawPerformancePeer[]): PerformanceDistributionBin[] => {
  return Array.from({ length: BIN_COUNT }, (_, index) => {
    const x0 = BIN_MIN + BIN_WIDTH * index;
    const x1 = x0 + BIN_WIDTH;
    const count = peers.filter((peer) => {
      const { pnlPct } = peer.metrics;
      if (index === BIN_COUNT - 1) {
        return pnlPct >= x0 && pnlPct <= x1;
      }
      return pnlPct >= x0 && pnlPct < x1;
    }).length;

    return {
      x0: roundTo(x0, 4),
      x1: roundTo(x1, 4),
      count,
    };
  });
};

const MANUAL_PEERS: RawPerformancePeer[] = [
  {
    wallet: "0xvault-peer-top1",
    metrics: {
      depositsUsd: 20000,
      withdrawalsUsd: 0,
      currentValueUsd: 28221,
      pnlUsd: 8221,
      pnlPct: roundTo(8221 / 20000, 4),
    },
  },
  {
    wallet: "0xvault-peer-top2",
    metrics: {
      depositsUsd: 14500,
      withdrawalsUsd: 0,
      currentValueUsd: 19602,
      pnlUsd: 5102,
      pnlPct: roundTo(5102 / 14500, 4),
    },
  },
  {
    wallet: "0xvault-peer-you",
    metrics: {
      depositsUsd: 5000,
      withdrawalsUsd: 0,
      currentValueUsd: 5412.5,
      pnlUsd: 412.5,
      pnlPct: 0.0825,
    },
  },
  {
    wallet: "0xvault-peer-bottom1",
    metrics: {
      depositsUsd: 9200,
      withdrawalsUsd: 0,
      currentValueUsd: 7420,
      pnlUsd: -1780,
      pnlPct: roundTo(-1780 / 9200, 4),
    },
  },
  {
    wallet: "0xvault-peer-bottom2",
    metrics: {
      depositsUsd: 12500,
      withdrawalsUsd: 1100,
      currentValueUsd: 10200,
      pnlUsd: -1200,
      pnlPct: roundTo(-1200 / 12500, 4),
    },
  },
];

const createRandomPeer = (
  binIndex: number,
  random: () => number,
  iteration: number
): RawPerformancePeer => {
  const idSuffix = `${binIndex.toString(16).padStart(2, "0")}${iteration
    .toString(16)
    .padStart(2, "0")}`;
  const wallet = `0xvault-peer-${idSuffix}`;

  const x0 = BIN_MIN + BIN_WIDTH * binIndex;
  const x1 = x0 + BIN_WIDTH;
  const pnlPct = roundTo(x0 + (x1 - x0) * random(), 4);
  const depositsUsd = roundTo(4000 + random() * 45000, 2);
  const pnlUsd = roundTo(depositsUsd * pnlPct, 2);
  const gross = Math.max(0, depositsUsd + pnlUsd);
  const withdrawalsUsd =
    pnlPct > 0 && random() < 0.25
      ? roundTo(gross * random() * 0.3, 2)
      : 0;
  const currentValueUsd = roundTo(gross - withdrawalsUsd, 2);

  return {
    wallet,
    metrics: {
      depositsUsd,
      withdrawalsUsd,
      currentValueUsd,
      pnlUsd,
      pnlPct,
    },
  };
};

const buildDataset = (): PerformanceDataset => {
  const binRemaining = TARGET_BIN_COUNTS.slice();
  const peers: RawPerformancePeer[] = [];
  const random = mulberry32(0x11af);

  for (const manual of MANUAL_PEERS) {
    peers.push(manual);
    const binIndex = getBinIndex(manual.metrics.pnlPct);
    if (binRemaining[binIndex] > 0) {
      binRemaining[binIndex] -= 1;
    }
  }

  for (let binIndex = 0; binIndex < BIN_COUNT; binIndex++) {
    const count = binRemaining[binIndex];
    for (let iteration = 0; iteration < count; iteration++) {
      peers.push(createRandomPeer(binIndex, random, iteration));
    }
  }

  const bins = buildBins(peers);
  const cohortSize = peers.length;

  return {
    peers,
    bins,
    cohortSize,
    yourWallet: "0xvault-peer-you",
    context: {
      apr24h: 0.124,
      apr7d: 0.138,
      apy7d: 0.148,
      utilizationRate: 0.67,
      feesRewards24h: 15892.12,
    },
  };
};

const DEFAULT_DATASET = buildDataset();

export const DEFAULT_PERFORMANCE_VAULT_ID = "0xvault-usdc-sui";
export const DEFAULT_PERFORMANCE_WALLET = DEFAULT_DATASET.yourWallet;

export const performanceDatasets: Record<string, PerformanceDataset> = {
  [DEFAULT_PERFORMANCE_VAULT_ID]: DEFAULT_DATASET,
};

export const getPerformanceDataset = (vaultId: string): PerformanceDataset => {
  return performanceDatasets[vaultId] ?? DEFAULT_DATASET;
};
