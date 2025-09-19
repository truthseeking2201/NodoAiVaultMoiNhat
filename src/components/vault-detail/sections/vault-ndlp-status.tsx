import { memo, useState } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERIOD_TABS } from "@/components/vault-detail/constant";
import VaultNdlpPrice from "../charts/vault-ndlp-price";
import { useQuery } from "@tanstack/react-query";
import { getVaultNdlpPriceChart } from "@/apis/vault";
import { useWallet } from "@/hooks/use-wallet";

interface NdlpStatusProps {
  vaultId: string;
  isDetailLoading: boolean;
}

const VaultNdlpStatus = ({ vaultId, isDetailLoading }: NdlpStatusProps) => {
  const [positionPeriodTab, setPositionPeriodTab] = useState(
    PERIOD_TABS[0].value
  );

  const {
    data: vaultNdlpPriceData,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["vaultNdlpPriceChart", vaultId, positionPeriodTab],
    queryFn: () => getVaultNdlpPriceChart(vaultId, positionPeriodTab),
    gcTime: 0,
    enabled: !!vaultId,
  });

  return (
    <DetailWrapper
      title="NDLP Price"
      titleClassName="flex flex-row"
      hasTitlePadding={false}
      isLoading={isDetailLoading}
      titleComponent={
        <Tabs
          value={positionPeriodTab}
          onValueChange={(value) => setPositionPeriodTab(value)}
        >
          <TabsList className="p-1 flex gap-1">
            {PERIOD_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <VaultNdlpPrice
        periodTab={positionPeriodTab}
        ndlpPriceData={vaultNdlpPriceData}
        isFetching={isFetching}
        isFetched={isFetched}
      />
    </DetailWrapper>
  );
};

export default memo(VaultNdlpStatus);
