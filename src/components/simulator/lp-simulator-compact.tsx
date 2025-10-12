import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SimulatorInput } from "./types";
import { useLpSim } from "./hooks/use-lp-sim";
import ResultsSummary from "./parts/results-summary";

type Props = {
  value: SimulatorInput;
  onChange: (value: SimulatorInput) => void;
  className?: string;
};

export default function LpSimulatorCompact({ value, onChange, className }: Props) {
  const [internalInput, setInternalInput] = useState<SimulatorInput>(value);
  const input = value ?? internalInput;

  const setInput = useMemo(() => {
    if (onChange) {
      return onChange;
    }
    return (next: SimulatorInput) => setInternalInput(next);
  }, [onChange]);

  const output = useLpSim(input);

  const containerClasses = cn(
    "w-full mx-auto",
    className
  );

  const set = (patch: Partial<SimulatorInput>) => setInput({ ...input, ...patch });

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {(["base", "quote"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`flex-1 text-sm py-2 rounded-md border transition-colors ${
                    input.baseOrQuote === opt
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:border-white/20"
                  }`}
                  onClick={() => set({ baseOrQuote: opt })}
                >
                  {opt === "base" ? "Token A" : "Token B"}
                </button>
              ))}
            </div>

            <div>
              <div className="text-white/70 text-xs mb-1">Deposit Amount</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white"
                  value={input.depositAmount}
                  onChange={(event) => set({ depositAmount: Number(event.target.value) })}
                  min={0}
                />
                <span className="text-xs text-white/60">USDC</span>
              </div>
            </div>

            <div>
              <div className="text-white/70 text-xs mb-2">Price Change</div>
              <div className="flex gap-2 mb-2">
                {[-25, -10, 0, 10, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`text-xs rounded-md px-2 py-1 border transition-colors ${
                      input.priceChangePct === preset
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 text-white/70 hover:border-white/20"
                    }`}
                    onClick={() => set({ priceChangePct: preset })}
                  >
                    {preset > 0 ? `+${preset}%` : `${preset}%`}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={-25}
                max={25}
                step={1}
                value={input.priceChangePct}
                onChange={(event) => set({ priceChangePct: Number(event.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="text-white/70 text-xs mb-2">Time Horizon</div>
              <div className="flex gap-2">
                {(["1D", "7D", "30D", "90D"] as const).map((horizon) => (
                  <button
                    key={horizon}
                    type="button"
                    className={`flex-1 text-xs py-2 rounded-md border transition-colors ${
                      input.horizon === horizon
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 text-white/70 hover:border-white/20"
                    }`}
                    onClick={() => set({ horizon })}
                  >
                    {horizon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col gap-4">
          <ResultsSummary data={output} />
        </div>
      </div>
    </div>
  );
}
