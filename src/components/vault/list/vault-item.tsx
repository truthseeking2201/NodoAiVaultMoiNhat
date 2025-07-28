import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { DepositVaultConfig } from "@/types/vault-config.types";

export const VaultItem = ({ item }: { item: DepositVaultConfig }) => {
  const { windowWidth } = useBreakpoint();
  const isLargeScreen = windowWidth >= 1440;
  const exchange_id = item?.exchange_id;
  const exchange = EXCHANGE_CODES_MAP[exchange_id];
  const tokens = item.pool.pool_name.split("-");

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center">
        {tokens?.length > 0 &&
          tokens.map((token, index) => (
            <img
              key={token}
              src={`/coins/${token?.toLowerCase()}.png`}
              alt={token}
              className={cn(
                "rounded-full",
                isLargeScreen ? "w-[36px] h-[36px]" : "w-[24px] h-[24px]"
              )}
            />
          ))}
      </div>
      <div className="m-4">
        <div className="font-semibold text-white text-base leading-tight mb-1">
          {item.vault_name}
        </div>
        <div className="flex gap-1 items-center text-base">
          <img src={`/dexs/${exchange?.code}.png`} className="h-[12px]" />
          <div className={cn("font-sans font-semibold text-xs")}>
            {exchange.name}
          </div>
        </div>
      </div>
    </div>
  );
};
