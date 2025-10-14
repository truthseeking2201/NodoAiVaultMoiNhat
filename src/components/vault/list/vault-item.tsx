import { cn } from "@/lib/utils";
import { VaultItemData } from "./vault-list";

const CHIP_BASE =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none";

export const VaultItem = ({ item }: { item: VaultItemData }) => {
  const chipLabel =
    item.exchange_code === "mmt" ? "Momentum" : item.exchange_name;
  const chipToneClass =
    item.exchange_code === "mmt"
      ? "bg-white/5 border-white/10 text-white/70"
      : "bg-white/5 border-white/10 text-white/60";

  return (
    <div className="flex min-w-0 items-center gap-3">
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
        <div className="truncate text-[15px] font-medium leading-[22px] text-white/90">
          {item.vault_name}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={cn(CHIP_BASE, chipToneClass)}>{chipLabel}</span>
        </div>
      </div>
    </div>
  );
};
