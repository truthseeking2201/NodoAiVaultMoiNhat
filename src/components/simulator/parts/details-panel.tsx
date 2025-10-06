import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

type Props = {
  feesUsd: number;
  ilUsd: number;
  rebalanceUsd: number;
};

export default function DetailsPanel({ feesUsd, ilUsd, rebalanceUsd }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5">
      <Accordion type="multiple" defaultValue={[]} className="divide-y divide-white/10">
        <Panel id="fees" label="Fees Earned" value={feesUsd} description="Trading fees captured by the pool during the selected horizon." />
        <Panel id="il" label="Impermanent Loss" value={ilUsd} description="Value drift from price divergence compared to holding." />
        <Panel id="rebalance" label="Rebalance Delta" value={rebalanceUsd} description="Impact from rebalancing or hedging adjustments." />
      </Accordion>
    </div>
  );
}

type PanelProps = {
  id: string;
  label: string;
  value: number;
  description: string;
};

function Panel({ id, label, value, description }: PanelProps) {
  const tone = value === 0 ? "text-white" : value > 0 ? "text-green-increase" : "text-red-400";
  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="px-4 py-3 text-sm text-white/80 hover:no-underline">
        <div className="flex w-full items-center justify-between">
          <span>{label}</span>
          <span className={`font-mono text-sm ${tone}`}>{formatCurrency(value)}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 text-xs text-white/60 leading-relaxed">
        {description}
      </AccordionContent>
    </AccordionItem>
  );
}
