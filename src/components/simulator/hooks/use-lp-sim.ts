import { useMemo } from "react";
import { SimulatorInput, SimulatorOutput } from "../types";

export function useLpSim(input: SimulatorInput): SimulatorOutput {
  return useMemo(() => {
    // TODO: replace placeholder calculations with actual logic from backend/data once available
    const ndlpPriceProjected = 1.0;
    const swapCostUsd = 23.45;
    const feesUsd = 0;
    const ilUsd = 0;
    const rebalanceDeltaUsd = 0;
    const holdValueUsd = input.depositAmount;
    const lpValueUsd = input.depositAmount;

    const pnlUsd = lpValueUsd - holdValueUsd;
    const pnlPct = input.depositAmount
      ? (pnlUsd / input.depositAmount) * 100
      : 0;

    return {
      ndlpPriceProjected,
      pnlUsd,
      pnlPct,
      holdValueUsd,
      lpValueUsd,
      feesUsd,
      ilUsd,
      rebalanceDeltaUsd,
      swapCostUsd,
    } satisfies SimulatorOutput;
  }, [input]);
}
