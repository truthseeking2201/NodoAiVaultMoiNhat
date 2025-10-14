import { cn } from "@/lib/utils";
import { VaultItemData } from "./vault-list";

const CHIP_BASE =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none";

export const VaultItem = ({ item }: { item: VaultItemData }) => {
  const chipLabel =
    item.exchange_code === "mmt" ? "Momentum" : item.exchange_name;
  const chipToneClass =
    item.exchange_code === "mmt"
      ? "bg-transparent border-transparent text-white"
      : "bg-transparent border-transparent text-white/60";

  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex -space-x-2">
        {item.token_pools?.map((token, index) => (
          <img
            key={`${item.vault_id}-${token.name}-${index}`}
            src={token.image}
            alt={token.name}
            className="h-8 w-8 rounded-full border-2 border-black bg-white"
          />
        ))}
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-bold leading-normal text-white font-['DM_Sans']">
          {item.vault_name}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {item.exchange_code === "mmt" && (
            <img 
              src="/dexs/mmt.png" 
              alt="Momentum" 
              className="h-3.5 w-5" 
            />
          )}
          <span className={cn(CHIP_BASE, chipToneClass, "text-[11.5px] font-bold tracking-tight")}>
            {chipLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
