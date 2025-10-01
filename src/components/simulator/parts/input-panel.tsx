import { SimulatorInput } from "../types";

type Props = {
  value: SimulatorInput;
  onChange: (value: SimulatorInput) => void;
  swapCostUsd: number;
};

export default function InputPanel({ value, onChange, swapCostUsd }: Props) {
  const set = (patch: Partial<SimulatorInput>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        {(["base", "quote"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            className={`flex-1 text-sm py-2 rounded-md border transition-colors ${
              value.baseOrQuote === opt
                ? "border-white/40 bg-white/10 text-white"
                : "border-white/10 text-white/70 hover:border-white/20"
            }`}
            onClick={() => set({ baseOrQuote: opt })}
          >
            {opt === "base" ? "Base Token" : "Quote Token"}
          </button>
        ))}
      </div>

      <div>
        <div className="text-white/70 text-xs mb-1">Deposit Amount</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="flex-1 bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white"
            value={value.depositAmount}
            onChange={(event) => set({ depositAmount: Number(event.target.value) })}
            min={0}
          />
          <span className="text-xs text-white/60">USDC</span>
        </div>
        <div className="mt-2 flex gap-2">
          {[100, 1000, 10000].map((preset) => (
            <button
              key={preset}
              type="button"
              className="text-xs border border-white/10 rounded-md px-2 py-1 text-white/80 hover:bg-white/5"
              onClick={() => set({ depositAmount: preset })}
            >
              {preset >= 1000 ? `${preset / 1000}k` : preset}
            </button>
          ))}
        </div>
        {swapCostUsd > 0 && (
          <div className="text-[11px] text-white/60 mt-2">
            Estimated swap cost: ${swapCostUsd.toFixed(2)}
          </div>
        )}
      </div>

      <div>
        <div className="text-white/70 text-xs mb-2">Price Change</div>
        <div className="flex gap-2 mb-2">
          {[-25, -10, 0, 10, 25].map((preset) => (
            <button
              key={preset}
              type="button"
              className={`text-xs rounded-md px-2 py-1 border transition-colors ${
                value.priceChangePct === preset
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
          value={value.priceChangePct}
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
                value.horizon === horizon
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
  );
}
