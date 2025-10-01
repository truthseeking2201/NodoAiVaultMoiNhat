import { SimulatorOutput } from "../types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

type Props = {
  data: SimulatorOutput;
};

export default function ResultsSummary({ data }: Props) {
  const pnlClass = data.pnlUsd === 0
    ? "text-white"
    : data.pnlUsd > 0
      ? "text-green-increase"
      : "text-red-400";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/70">
        <SummaryItem
          label="NDLP Price"
          value={data.ndlpPriceProjected.toFixed(4)}
          helper="Projected after move"
        />
        <SummaryItem
          label="P&L (USD)"
          value={formatCurrency(data.pnlUsd)}
          helper="Net after fees & IL"
          valueClass={pnlClass}
        />
        <SummaryItem
          label="P&L (%)"
          value={formatPercent(data.pnlPct)}
          helper="Return vs. deposit"
          valueClass={pnlClass}
        />
      </div>
    </div>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
  helper?: string;
  valueClass?: string;
};

function SummaryItem({ label, value, helper, valueClass }: SummaryItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-white/50">
        {label}
      </span>
      <span className={`text-lg font-semibold text-white ${valueClass ?? ""}`}>
        {value}
      </span>
      {helper && <span className="text-xs text-white/50">{helper}</span>}
    </div>
  );
}
