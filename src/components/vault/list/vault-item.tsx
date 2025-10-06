import { isMockMode } from "@/config/mock";
import { useStreak } from "@/features/streak-vault/hooks/use-streak";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import { VaultItemData } from "./vault-list";

export const VaultItem = ({ item }: { item: VaultItemData }) => {
  const { windowWidth, isMd } = useBreakpoint();
  const { address, isConnected } = useWallet();
  const { record } = useStreak(item.vault_id, address ?? undefined);
  const isLargeScreen = windowWidth >= 1440;
  const showPill = isMockMode && isMd;
  const streakValue = record?.current ?? 0;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-[180px] max-w-[240px] items-center gap-4 2xl:max-w-none">
        <div className="flex items-center justify-center">
          {item.token_pools?.length > 0 &&
            item.token_pools.map((token) => (
              <img
                key={token.name}
                src={token.image}
                alt={token.name}
                className={cn(
                  "flex-shrink-0 rounded-full",
                  isLargeScreen ? "h-[32px] w-[32px]" : "h-[24px] w-[24px]"
                )}
              />
            ))}
        </div>
        <div>
          <div className="mb-1 text-base font-semibold leading-tight text-white">
            {item.vault_name}
          </div>
          <div className="flex items-center gap-1 text-base">
            <img
              src={item.exchange_image}
              alt={item.exchange_name}
              className="h-[12px]"
            />
            <div className="font-sans text-xs font-semibold text-white/70">
              {item.exchange_name}
            </div>
          </div>
        </div>
      </div>
      {showPill && (
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#101114] px-3 py-1 text-xs text-white/60 md:flex">
          <span>Streak</span>
          <span className="font-mono text-white">
            {isConnected ? `${streakValue}d` : "—"}
          </span>
        </div>
      )}
    </div>
  );
};
