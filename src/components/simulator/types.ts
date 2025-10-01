export type Horizon = "1D" | "7D" | "30D" | "90D";

export type SimulatorInput = {
  depositAmount: number;
  baseOrQuote: "base" | "quote";
  priceChangePct: number;
  horizon: Horizon;
};

export type SimulatorOutput = {
  ndlpPriceProjected: number;
  pnlUsd: number;
  pnlPct: number;
  holdValueUsd: number;
  lpValueUsd: number;
  feesUsd: number;
  ilUsd: number;
  rebalanceDeltaUsd: number;
  swapCostUsd: number;
};
