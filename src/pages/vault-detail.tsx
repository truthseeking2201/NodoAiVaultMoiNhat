import DetailsBackground from "@/assets/images/bg-details.webp";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import DepositWithdraw from "@/components/vault-detail/sections/deposit-withdraw";
import HeaderDetail from "@/components/vault-detail/sections/header-detail";
import HelpfulInfo from "@/components/vault-detail/sections/helpful-info";
import StrategyExplanation from "@/components/vault-detail/sections/strategy-explanation";
import VaultActivities from "@/components/vault-detail/sections/vault-activities";
import VaultAnalytics from "@/components/vault-detail/sections/vault-analytics";
import VaultInfo from "@/components/vault-detail/sections/vault-info";
import YourHoldings from "@/components/vault-detail/sections/your-holdings";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useGetDepositVaults, useVaultBasicDetails } from "@/hooks";
import { formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import UnderlineTabs from "@/components/ui/underline-tab";
import PositionStatus from "@/components/vault-detail/sections/position-status";

export type VaultInfo = {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  tooltip?: any;
};

const VaultDetail = () => {
  const { vault_id } = useParams();
  const { data: vaultDetails, isLoading: isLoadingVaultDetails } =
    useVaultBasicDetails(vault_id);
  const { isLg, isMd } = useBreakpoint();
  const {
    data: depositVaults,
    isLoading: isLoadingDepositVaults,
    isFetching: isFetchingDepositVaults,
    refetch: refetchDepositVaults,
  } = useGetDepositVaults();

  const [activeTab, setActiveTab] = useState(0);

  const depositVault = depositVaults?.find(
    (vault) => vault.vault_id === vault_id
  );

  const vaultListLoaded = depositVaults?.length > 0 && !isLoadingDepositVaults;
  let isValidVault = vaultListLoaded && !!depositVault;
  if (!isValidVault && isFetchingDepositVaults) {
    isValidVault = true;
  }
  const isDetailLoading = isLoadingVaultDetails || !vaultDetails;

  const navigate = useNavigate();

  const handleBackToHome = () => {
    refetchDepositVaults();
    navigate("/", { replace: true });
  };

  const vaultInfo = useMemo(() => {
    return [
      {
        label: "APY",
        tooltip:
          "Your real yearly return with hourly compounding, based on the average APR of the last 7 days. Updates every 1 hour.",
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.vault_apy,
            })
          : "--",
        suffix: "%",
      },
      {
        label: "TVL",
        tooltip: "Total Liquidity Value at the current market price",
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.total_value_usd,
            })
          : "--",
        prefix: "$",
      },
      {
        label: "24h Rewards",
        tooltip:
          "Total LP fees and token incentives earned by the vault in the last 24 hours. Updates every 1 hour.",
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.rewards_24h_usd,
            })
          : "--",
        prefix: "$",
      },
      {
        label: "NDLP Price",
        tooltip:
          "Price of 1 NDLP token based on the vault’s total value. (Unit USD)",
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.ndlp_price_usd,
              precision: 4,
            })
          : "--",
        prefix: "$",
      },
    ];
  }, [vaultDetails, isLoadingVaultDetails]);

  if ((!vaultDetails || !isValidVault) && !isLoadingVaultDetails) {
    return <Navigate to="/" replace />;
  }

  const tokens =
    (vaultDetails as BasicVaultDetailsType)?.pool?.pool_name?.split("-") || [];
  const exchange = EXCHANGE_CODES_MAP[
    (vaultDetails as BasicVaultDetailsType)?.exchange_id
  ] || {
    code: "",
    name: "",
    image: "",
  };

  return (
    <PageContainer
      backgroundImage={DetailsBackground}
      className="max-md:py-4 py-8"
    >
      <Button
        variant="outline"
        className="mb-4 border-white/30 text-sm"
        size={isMd ? "default" : "sm"}
        onClick={handleBackToHome}
      >
        <ChevronLeft className="!w-6 !h-6" />
        AI Vaults
      </Button>

      <HeaderDetail
        vault={vaultDetails}
        exchange={exchange}
        tokens={tokens}
        vaultInfo={vaultInfo}
        vaultDetails={vaultDetails}
        isDetailLoading={isDetailLoading}
      />
      <div className="p-3 mb-4 flex justify-between">
        <UnderlineTabs
          activeTab={activeTab}
          labels={["Overview", "Your Holdings"]}
          onActiveTabChange={setActiveTab}
        />
        <div>View by: TODO</div>
      </div>
      <ConditionRenderer
        when={activeTab === 0}
        fallback={
          <div className="flex gap-8 mb-[76px]">
            <div className="flex-1">
              <YourHoldings
                isDetailLoading={isDetailLoading}
                vault_id={vault_id}
                vault={vaultDetails}
              />
            </div>
            <div className="xl:w-[450px] w-[380px]">
              <DepositWithdraw
                vault_id={vault_id}
                isDetailLoading={isDetailLoading}
              />

              <div className="mt-6" />
              <HelpfulInfo isDetailLoading={isDetailLoading} />
            </div>
          </div>
        }
      >
        <ConditionRenderer
          when={isLg}
          fallback={
            <div>
              <DepositWithdraw
                vault_id={vault_id}
                isDetailLoading={isDetailLoading}
              />
              <div className="mt-4" />
              <VaultAnalytics
                vault_id={vault_id}
                isDetailLoading={isDetailLoading}
                vault={vaultDetails}
              />
              <div className="mt-4" />
              <HelpfulInfo isDetailLoading={isDetailLoading} />
              <div className="mt-4" />
              <VaultActivities
                isDetailLoading={isDetailLoading}
                vault_id={vault_id}
              />
              <div className="mt-4" />
              <StrategyExplanation
                vault={vaultDetails}
                isDetailLoading={isDetailLoading}
              />
              <div className="mt-4" />
              <VaultInfo
                vaultDetails={vaultDetails}
                isDetailLoading={isDetailLoading}
              />
            </div>
          }
        >
          <div className="flex gap-8 mb-[76px]">
            {/* Left sessions */}
            <div className="flex-1">
              <VaultAnalytics
                vault_id={vault_id}
                isDetailLoading={isDetailLoading}
                vault={vaultDetails}
              />

              <div className="mt-6" />
              <PositionStatus />
              <div className="mt-6" />
              <VaultActivities
                isDetailLoading={isDetailLoading}
                vault_id={vault_id}
              />
              <div className="mt-6" />
              <StrategyExplanation
                vault={vaultDetails}
                isDetailLoading={isDetailLoading}
              />
              <div className="mt-6" />
              <VaultInfo
                vaultDetails={vaultDetails}
                isDetailLoading={isDetailLoading}
              />
            </div>
            {/* Right sessions */}
            <div className="xl:w-[450px] w-[380px]">
              <DepositWithdraw
                vault_id={vault_id}
                isDetailLoading={isDetailLoading}
              />

              <div className="mt-6" />
              <HelpfulInfo isDetailLoading={isDetailLoading} />
            </div>
          </div>
        </ConditionRenderer>
      </ConditionRenderer>
    </PageContainer>
  );
};

export default VaultDetail;
