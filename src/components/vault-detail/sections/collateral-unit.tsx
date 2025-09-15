import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserAssetsStore, useVaultMetricUnitStore } from "@/hooks";
import { useMemo } from "react";

const CollateralUnit = ({
  collateralToken,
  vault_id,
}: {
  collateralToken: string;
  vault_id: string;
}) => {
  const { unit, setMetricUnit } = useVaultMetricUnitStore(vault_id);
  const usdValue = "usd";
  const { assets } = useUserAssetsStore();
  const depositTokens = JSON.parse(
    localStorage.getItem("cached-deposit-tokens") || "[]"
  );
  const collateralAsset = useMemo(() => {
    let collateralAsset = assets.find(
      (asset) => asset.coin_type === collateralToken
    );
    if (!collateralAsset) {
      const defaultToken = depositTokens.find(
        (token: any) => token.token_address === collateralToken
      );
      if (defaultToken) {
        collateralAsset = {
          ...defaultToken,
          display_name: defaultToken.token_symbol,
          symbol: defaultToken.token_symbol,
          image_url: `/coins/${defaultToken.token_symbol.toLowerCase()}.png`,
        };
      }
    }
    return collateralAsset;
  }, [assets, depositTokens, collateralToken]);

  if (!collateralToken) return <Skeleton className="w-[120px] h-10" />;

  return (
    <Tabs
      value={unit}
      onValueChange={(value) => setMetricUnit(value, vault_id)}
    >
      <TabsList className="flex gap-1">
        <TabsTrigger key={collateralToken} value={`${collateralAsset?.symbol}`}>
          <div className="flex items-center gap-1 min-w-[50px]">
            <div className="text-base font-medium">
              {collateralAsset?.display_name}
            </div>
            <img
              src={collateralAsset?.image_url}
              alt={collateralAsset?.display_name}
              className="w-4 h-4 rounded-full"
            />
          </div>
        </TabsTrigger>
        <TabsTrigger key={usdValue} value={usdValue}>
          <div className="text-base font-medium min-w-[50px]">$</div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default CollateralUnit;
