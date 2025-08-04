import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimeFilter } from "@/components/vault-detail/charts/type";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { useEffect, useState } from "react";

import { getVaultAnalytics } from "@/apis/vault";
import APYChart from "@/components/vault-detail/charts/apy";
import PositionPriceChart from "@/components/vault-detail/charts/position-price";
import {
  ANALYTICS_TABS,
  PERIOD_TABS,
  PERIOD_TABS_1W,
} from "@/components/vault-detail/constant";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { useQuery } from "@tanstack/react-query";

type VaultAnalyticsProps = {
  vault_id: string;
  isDetailLoading: boolean;
  vault: BasicVaultDetailsType;
};

const VaultAnalytics = ({
  vault_id,
  isDetailLoading,
  vault,
}: VaultAnalyticsProps) => {
  const [analyticsTab, setAnalyticsTab] = useState<string>(
    ANALYTICS_TABS?.[0]?.value
  );
  const [analyticsRangeTab, setAnalyticsRangeTab] = useState<TimeFilter>(
    PERIOD_TABS?.[0]?.value as TimeFilter
  );
  const [periodsOptions, setPeriodsOptions] = useState(PERIOD_TABS);

  const handleChangeAnalyticsTab = (value: string) => {
    if (value === "APY_YIELDS") {
      setAnalyticsRangeTab(PERIOD_TABS[0].value as TimeFilter);
      setPeriodsOptions(PERIOD_TABS);
    }
    setAnalyticsTab(value);
  };

  // Fetch data for the selected analytics tab
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["vaultAnalytics", analyticsTab, analyticsRangeTab],
    queryFn: () => getVaultAnalytics(vault_id, analyticsTab, analyticsRangeTab),
    enabled: !!analyticsTab && !!analyticsRangeTab,
  });

  const handleSwitchToWeekly = () => {
    setAnalyticsRangeTab(PERIOD_TABS_1W[0].value as TimeFilter);
    setPeriodsOptions(PERIOD_TABS_1W);
  };

  return (
    <DetailWrapper
      title="Vault Analytics"
      titleComponent={
        <div className="flex items-center gap-6">
          <Tabs
            value={analyticsTab}
            onValueChange={(value) => handleChangeAnalyticsTab(value)}
          >
            <TabsList className="p-1 flex gap-1">
              {ANALYTICS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs
            value={analyticsRangeTab}
            onValueChange={(value) => setAnalyticsRangeTab(value as TimeFilter)}
          >
            <TabsList className="p-1 flex gap-1">
              {periodsOptions.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      }
      className="!pb-0"
      isLoading={isDetailLoading}
      loadingStyle="h-[400px] w-full mb-4"
    >
      {/* Content for the selected analytics tab */}
      <div className="min-h-[400px]">
        {/* Placeholder for actual content based on the selected tab */}
        {analyticsTab === ANALYTICS_TABS?.[0]?.value && !isLoading && (
          <PositionPriceChart
            period={analyticsRangeTab}
            analyticsData={analyticsData}
            vault={vault}
            onSwitchToWeekly={handleSwitchToWeekly}
          />
        )}
        {analyticsTab === ANALYTICS_TABS?.[1]?.value && !isLoading && (
          <APYChart period={analyticsRangeTab} analyticsData={analyticsData} />
        )}
      </div>
    </DetailWrapper>
  );
};

export default VaultAnalytics;
