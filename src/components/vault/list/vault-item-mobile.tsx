import { VaultItemData } from "./vault-list";
import { cn, formatPercentage } from "@/lib/utils";
import VaultRewards from "./vault-rewards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/number";

type VaultCardProps = {
  item: VaultItemData;
  onRowClick: (item: VaultItemData) => void;
  HOLDING_TYPE: { label: string; value: string }[];
  holdingShowMode: string;
  setHoldingShowMode: (mode: string) => void;
};

const CHIP_BASE =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none";

const VaultItemMobile = ({
  item,
  onRowClick,
  HOLDING_TYPE,
  holdingShowMode,
  setHoldingShowMode,
}: VaultCardProps) => {
  const chipLabel =
    item.exchange_code === "mmt" ? "Momentum" : item.exchange_name;
  const chipToneClass =
    item.exchange_code === "mmt"
      ? "bg-white/5 border-white/10 text-white/70"
      : "bg-white/5 border-white/10 text-white/60";

  const tokenDisplay = (() => {
    if (!item.change_24h || item.change_24h.length === 0) {
      return "--";
    }
    const formatted = item.change_24h
      .map((token) => {
        const amount = Number(token.amount);
        if (!amount) return null;
        const precision = amount < 1 ? 6 : 2;
        return `${formatNumber(amount, 0, precision)} ${token.token_symbol}`;
      })
      .filter(Boolean);
    return formatted.length > 0 ? formatted.join(" • ") : "--";
  })();

  const holdingsDisplay =
    holdingShowMode === HOLDING_TYPE[0].value
      ? tokenDisplay
      : (item.user_holdings_show as string) ?? "--";

  const apyRaw = item.daily_compounding_apy ?? item.vault_apy ?? "";
  const apyNumeric = Number(apyRaw);
  const apyDisplay =
    !apyRaw || Number.isNaN(apyNumeric) || apyNumeric === 0
      ? "--"
      : formatPercentage(apyNumeric);

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#121317] p-4 first:mt-0">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          {item.token_pools?.map((token, index) => (
            <img
              key={`${item.vault_id}-${token.name}-${index}`}
              src={token.image}
              alt={token.name}
              className="h-10 w-10 rounded-full border border-[#121317] bg-[#121317]"
            />
          ))}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium leading-[22px] text-white/90">
            {item.vault_name}
          </p>
          <span className={cn(CHIP_BASE, chipToneClass)}>{chipLabel}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <InfoBlock label="TVL" value={item.total_value_usd_show ?? "--"} />
        <InfoBlock
          label="APY"
          value={apyDisplay}
          valueClassName={
            apyDisplay !== "--" ? "text-emerald-400 font-medium" : "text-white/70"
          }
        />
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">
              Your Holdings
            </p>
            <Tabs value={holdingShowMode} onValueChange={setHoldingShowMode}>
              <TabsList className="flex gap-1 rounded-full bg-white/5 p-1">
                {HOLDING_TYPE.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="!px-3 !py-1 text-[11px]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <p className="mt-2 text-right font-mono text-sm text-white/90 tabular-nums">
            {holdingsDisplay}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/45">
            Rewards
          </p>
          <div className="mt-2 flex justify-start">
            <VaultRewards item={item} />
          </div>
        </div>
      </div>

      <button
        onClick={() => onRowClick(item)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/15"
      >
        Deposit
      </button>
    </div>
  );
};

type InfoBlockProps = {
  label: string;
  value: string | number;
  valueClassName?: string;
};

const InfoBlock = ({ label, value, valueClassName }: InfoBlockProps) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-white/45">
      {label}
    </p>
    <p
      className={cn(
        "mt-2 font-mono text-sm text-white/90 tabular-nums",
        valueClassName
      )}
    >
      {value}
    </p>
  </div>
);

export default VaultItemMobile;
