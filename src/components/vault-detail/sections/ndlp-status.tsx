import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { PERIOD_TABS } from "@/components/vault-detail/constant";
import NdlpPrice from "../charts/ndlp-price";

const NdlpStatus = () => {
  const [positionPeriodTab, setPositionPeriodTab] = useState(
    PERIOD_TABS[0].value
  );

  return (
    <DetailWrapper
      title="NDLP Price"
      titleClassName="flex flex-row items-center justify-between"
      hasTitlePadding={false}
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
      <NdlpPrice periodTab={positionPeriodTab} />
    </DetailWrapper>
  );
};

export default NdlpStatus;
