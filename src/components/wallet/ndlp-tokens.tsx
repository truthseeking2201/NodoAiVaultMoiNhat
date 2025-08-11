import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useNdlpAssetsStore } from "@/hooks";
import { formatNumber } from "@/lib/number";
import { cn } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

export const NdlpTokens = () => {
  const { assets } = useNdlpAssetsStore();
  const filteredAssets = useMemo(
    () => assets.filter((asset) => new BigNumber(asset.balance).gt(0)),
    [assets]
  );

  if (filteredAssets.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="font-sans font-medium text-sm mb-3">
        NDLP Tokens ({filteredAssets.length})
      </div>
      <div
        className={cn(
          "rounded-lg border border-white/10 bg-[rgba(255, 255, 255, 0.08)] max-h-[200px] overflow-y-auto px-3"
        )}
      >
        {filteredAssets.map((asset, index) => {
          const vault = asset?.vault;
          const exchange_id = vault?.exchange_id;
          const exchange = EXCHANGE_CODES_MAP[exchange_id];
          const tokens = vault?.pool.pool_name.split("-");

          return (
            <div
              key={asset.coin_type}
              className={cn(
                "flex justify-between items-center gap-3 py-3",
                index !== filteredAssets.length - 1 &&
                  "border-b border-white/15 pb-3"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {tokens?.length > 0 &&
                  tokens.map((token, index) => (
                    <img
                      key={token}
                      src={`/coins/${token?.toLowerCase()}.png`}
                      alt={token}
                      className={cn(
                        "rounded-full w-[20px] h-[20px]",
                        index > 0 && "ml-[-15px]"
                      )}
                    />
                  ))}
                <div>
                  <div className="font-bold text-white text-sm mb-1">
                    {vault?.vault_name}
                  </div>
                  <div className="flex gap-1 items-center text-xs font-medium">
                    <img
                      src={`/dexs/${exchange?.code}.png`}
                      className="h-[10px]"
                    />
                    {exchange.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-regular font-mono text-sm text-white mb-0.5">
                  {formatNumber(asset.balance, 0, asset.decimals || 6)}
                </div>
                <div className="font-regular font-mono text-xs text-white/50">
                  $
                  {asset.balance_usd
                    ? formatNumber(asset.balance_usd, 0, 2)
                    : "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
