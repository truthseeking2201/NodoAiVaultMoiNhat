import { useState } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERIOD_TABS } from "@/components/vault-detail/constant";
import NdlpPrice from "../charts/ndlp-price";
import { useQuery } from "@tanstack/react-query";
import { getNdlpPriceChart } from "@/apis/vault";
import { useWallet } from "@/hooks/use-wallet";

interface NdlpStatusProps {
  vaultId: string;
  isDetailLoading: boolean;
}

const NdlpStatus = ({ vaultId, isDetailLoading }: NdlpStatusProps) => {
  const [positionPeriodTab, setPositionPeriodTab] = useState(
    PERIOD_TABS[0].value
  );
  const { isAuthenticated } = useWallet();

  const {
    data: ndlpPriceData,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["ndlpPriceChart", vaultId, positionPeriodTab],
    queryFn: () => getNdlpPriceChart(vaultId, positionPeriodTab),
    gcTime: 0,
    enabled: !!vaultId && isAuthenticated,
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
      <NdlpPrice
        periodTab={positionPeriodTab}
        ndlpPriceData={ndlpPriceData}
      />
    </DetailWrapper>
  );
};

export default NdlpStatus;
