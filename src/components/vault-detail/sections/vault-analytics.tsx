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
} from "@/components/vault-detail/constant";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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

  const [isEmpty, setIsEmpty] = useState(true);
  const handleEmptyState = (empty: boolean) => {
    setIsEmpty(empty);
  };

  // Fetch data for the selected analytics tab
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["vaultAnalytics", analyticsTab, analyticsRangeTab],
    queryFn: () => getVaultAnalytics(vault_id, analyticsTab, analyticsRangeTab),
    enabled: !!analyticsTab && !!analyticsRangeTab,
    gcTime: 0,
  });

  useEffect(() => {
    setIsEmpty(false);
  }, [analyticsTab, analyticsRangeTab]);

  return (
    <DetailWrapper
      title="Vault Analytics"
      titleComponent={
        <div className="flex items-center md:gap-6 gap-2 justify-between">
          <Tabs
            value={analyticsTab}
            onValueChange={(value) => setAnalyticsTab(value)}
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
              {PERIOD_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      }
      isLoading={isDetailLoading}
      loadingStyle={cn("w-full", isEmpty ? "h-fit" : "min-h-[400px]")}
    >
      {/* Content for the selected analytics tab */}
      <div className={cn(isEmpty ? "h-fit" : "min-h-[400px]")}>
        {/* Placeholder for actual content based on the selected tab */}
        {analyticsTab === ANALYTICS_TABS?.[0]?.value && (
          <PositionPriceChart
            period={analyticsRangeTab}
            analyticsData={analyticsData}
            vault={vault}
            isLoading={isLoading}
            onEmptyStateChange={handleEmptyState}
          />
        )}
        {/* {analyticsTab === ANALYTICS_TABS?.[1]?.value && (
          <APYChart
            period={analyticsRangeTab}
            analyticsData={analyticsData}
            isLoading={isLoading}
            onEmptyStateChange={handleEmptyState}
          />
        )} */}
      </div>
    </DetailWrapper>
  );
};

export default VaultAnalytics;
