import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserAssetsStore, useVaultMetricUnitStore } from "@/hooks";

const CollateralUnit = ({ collateralToken }: { collateralToken: string }) => {
  const { unit, setMetricUnit } = useVaultMetricUnitStore();
  const usdValue = "usd";
  const { assets } = useUserAssetsStore();
  const collateralAsset = assets.find(
    (asset) => asset.coin_type === collateralToken
  );

  if (!collateralToken) return <Skeleton className="w-[120px] h-10" />;

  return (
    <Tabs value={unit} onValueChange={(value) => setMetricUnit(value)}>
      <TabsList className="flex gap-1">
        <TabsTrigger key={collateralToken} value={`${collateralAsset.symbol}`}>
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
