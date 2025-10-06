import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import InputPanel from "./parts/input-panel";
import ResultsSummary from "./parts/results-summary";
import HoldVsLP from "./parts/hold-vs-lp";
import DetailsPanel from "./parts/details-panel";
import PlainExplanation from "./parts/plain-explanation";
import { useLpSim } from "./hooks/use-lp-sim";
import { SimulatorInput } from "./types";

type Props = {
  value?: SimulatorInput;
  onChange?: (value: SimulatorInput) => void;
  className?: string;
  copyLabel?: string;
  withPadding?: boolean;
};

const DEFAULT_INPUT: SimulatorInput = {
  depositAmount: 1000,
  baseOrQuote: "base",
  priceChangePct: 0,
  horizon: "7D",
};

export default function LpSimulator({
  value,
  onChange,
  className,
  copyLabel = "Copy scenario",
  withPadding = true,
}: Props) {
  const [internalInput, setInternalInput] = useState<SimulatorInput>(value ?? DEFAULT_INPUT);
  const input = value ?? internalInput;

  const setInput = useMemo(() => {
    if (onChange) {
      return onChange;
    }
    return (next: SimulatorInput) => setInternalInput(next);
  }, [onChange]);

  const output = useLpSim(input);

  const handleCopy = () => {
    const summary = `LP Simulator | deposit=${input.depositAmount} ${input.baseOrQuote} | price=${input.priceChangePct}% | horizon=${input.horizon} | pnlUsd=${output.pnlUsd.toFixed(2)} | pnlPct=${output.pnlPct.toFixed(2)}%`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(summary).catch(() => {
        /* swallow copy errors */
      });
    }
  };

  const containerClasses = cn(
    "w-full mx-auto",
    withPadding ? "p-4 md:p-6" : "",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <InputPanel value={input} onChange={setInput} swapCostUsd={output.swapCostUsd} />
        </div>

        <div className="md:col-span-8 flex flex-col gap-4">
          <ResultsSummary data={output} />
          <HoldVsLP holdUsd={output.holdValueUsd} lpUsd={output.lpValueUsd} />
          <DetailsPanel
            feesUsd={output.feesUsd}
            ilUsd={output.ilUsd}
            rebalanceUsd={output.rebalanceDeltaUsd}
          />
          <PlainExplanation input={input} output={output} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="border border-white/20 text-white/90 text-xs px-3 py-1.5 rounded-md hover:bg-white/5"
            >
              {copyLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
