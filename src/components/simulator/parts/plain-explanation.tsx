import { SimulatorInput, SimulatorOutput } from "../types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatDelta = (value: number) => {
  const absolute = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(absolute);
  if (value === 0) return `${formatted} difference`;
  return value > 0 ? `${formatted} more` : `${formatted} less`;
};

type Props = {
  input: SimulatorInput;
  output: SimulatorOutput;
};

export default function PlainExplanation({ input, output }: Props) {
  const delta = output.lpValueUsd - output.holdValueUsd;
  const sentiment = delta === 0 ? "the same outcome" : delta > 0 ? "a gain" : "a loss";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
      If the market moves {input.priceChangePct > 0 ? `up ${input.priceChangePct}%` : input.priceChangePct < 0 ? `down ${Math.abs(input.priceChangePct)}%` : "sideways"} over {input.horizon},
      providing liquidity with {formatCurrency(input.depositAmount)} in {input.baseOrQuote === "base" ? "base" : "quote"} tokens could deliver {sentiment}, roughly {formatDelta(delta)} compared with simply holding.
    </div>
  );
}
