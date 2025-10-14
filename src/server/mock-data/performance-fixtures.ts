type PeerMetrics = {
  depositsUsd: number;
  withdrawalsUsd: number;
  currentValueUsd: number;
  pnlUsd: number;
  pnlPct: number;
};

type PeerHistory = {
  pnlUsd: {
    now: number;
    d1?: number;
    d7?: number;
  };
};

type RawPerformancePeer = {
  wallet: string;
  metrics: PeerMetrics;
  history: PeerHistory;
};

type PerformanceDataset = {
  peers: RawPerformancePeer[];
  cohortSize: number;
  yourWallet: string;
  context: {
    utilization: number;
    feesRewards24hUsd: number;
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
    history: {
      pnlUsd: {
        now: 8221,
        d1: 7821,
        d7: 7200,
      },
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
    history: {
      pnlUsd: {
        now: 5102,
        d1: 4952,
        d7: 4700,
      },
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
    history: {
      pnlUsd: {
        now: 412.5,
        d1: 380.2,
        d7: 295.4,
      },
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
    history: {
      pnlUsd: {
        now: -1780,
        d1: -1650,
        d7: -1500,
      },
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
    history: {
      pnlUsd: {
        now: -1200,
        d1: -1185,
        d7: -950,
      },
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
  const change1d = roundTo((random() - 0.5) * 800, 2);
  const change7d = roundTo((random() - 0.5) * 2000, 2);

  return {
    wallet,
    metrics: {
      depositsUsd,
      withdrawalsUsd,
      currentValueUsd,
      pnlUsd,
      pnlPct,
    },
    history: {
      pnlUsd: {
        now: pnlUsd,
        d1: pnlUsd - change1d,
        d7: pnlUsd - change7d,
      },
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

  const cohortSize = peers.length;

  return {
    peers,
    cohortSize,
    yourWallet: "0xvault-peer-you",
    context: {
      utilization: 0.67,
      feesRewards24hUsd: 15892.12,
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
