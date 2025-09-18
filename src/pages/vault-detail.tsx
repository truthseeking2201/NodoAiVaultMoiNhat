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
import {
  useGetDepositVaults,
  useGetLpToken,
  useVaultBasicDetails,
  useVaultMetricUnitStore,
} from "@/hooks";
import { cn, formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import UnderlineTabs from "@/components/ui/underline-tab";
import NdlpStatus from "@/components/vault-detail/sections/ndlp-status";
import CollateralUnit from "@/components/vault-detail/sections/collateral-unit";
import { formatCollateralUsdNumber } from "@/components/vault-detail/helpers";
import BigNumber from "bignumber.js";

export type VaultInfo = {
  label: string;
  value: string;
  prefix?: string | JSX.Element;
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
  const lpToken = useGetLpToken(vaultDetails?.vault_lp_token, vault_id);
  const hasLPBalance =
    lpToken?.balance && new BigNumber(lpToken?.balance).gt(0);

  const [activeTab, setActiveTab] = useState(0);
  const { isUsd, unit } = useVaultMetricUnitStore(vault_id);
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

  const isBreakMobile = useMemo(() => {
    return !isLg;
  }, [isLg]);

  const unitIcon = useMemo(
    () =>
      isUsd ? (
        "$"
      ) : (
        <img
          src={`/coins/${unit?.toLowerCase()}.png`}
          className="w-4 h-4"
          alt={unit}
        />
      ),
    [isUsd, unit]
  );

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
          ? formatCollateralUsdNumber({
              value_usd: vaultDetails?.total_value_usd,
              value_collateral: vaultDetails?.total_value_collateral,
              isUsd,
              unit,
            })
          : "--",
        prefix: unitIcon,
      },
      {
        label: "24h Rewards",
        tooltip:
          "Total LP fees and token incentives earned by the vault in the last 24 hours. Updates every 1 hour.",
        value: !isLoadingVaultDetails
          ? formatCollateralUsdNumber({
              value_usd: vaultDetails?.rewards_24h_usd,
              value_collateral: vaultDetails?.rewards_24h_collateral,
              isUsd,
              unit,
            })
          : "--",
        prefix: unitIcon,
      },
      {
        label: "NDLP Price",
        tooltip: `Price of 1 NDLP token based on the vault’s total value. (Unit ${unit})`,
        value: !isLoadingVaultDetails
          ? formatCollateralUsdNumber({
              value_usd: vaultDetails?.ndlp_price_usd,
              value_collateral: vaultDetails?.ndlp_price,
              isUsd,
              unit,
            })
          : "--",
        prefix: unitIcon,
      },
    ];
  }, [vaultDetails, unitIcon, isUsd, isLoadingVaultDetails, unit]);

  useEffect(() => {
    if (hasLPBalance) {
      setActiveTab(1);
    }
  }, [hasLPBalance]);

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
      backgroundSize={isMd ? "cover" : "contain"}
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
      <ConditionRenderer when={!isBreakMobile}>
        <div className="md:p-3 max-md:mb-3 mb-4 flex justify-between">
          <UnderlineTabs
            activeTab={activeTab}
            labels={["Overview", "Your Holdings"]}
            labelClassName="max-md:text-base max-md:px-0"
            tabClassName="max-md:space-x-4"
            onActiveTabChange={setActiveTab}
          />
          <CollateralUnit
            collateralToken={vaultDetails?.collateral_token}
            vault_id={vault_id}
          />
        </div>
      </ConditionRenderer>

      <div
        className={cn(
          "flex",
          isBreakMobile && "flex-col",
          !isBreakMobile && "flex-row-reverse gap-4"
        )}
      >
        {/* Right sessions - start */}
        <div
          className={cn(
            isBreakMobile && "w-full",
            !isBreakMobile && "xl:w-[450px] w-[380px]",
            window.innerHeight > 900 && "sticky top-[10px] self-start"
          )}
        >
          <DepositWithdraw
            vault_id={vault_id}
            isDetailLoading={isDetailLoading}
          />
        </div>
        {/* Right sessions - end */}
        <ConditionRenderer when={isBreakMobile}>
          <div className="mt-4 mb-3 flex justify-between">
            <UnderlineTabs
              activeTab={activeTab}
              labels={["Overview", "Your Holdings"]}
              labelClassName="max-md:text-base max-md:px-0"
              tabClassName="max-md:space-x-4"
              onActiveTabChange={setActiveTab}
              key={activeTab}
            />
            <CollateralUnit
              collateralToken={vaultDetails?.collateral_token}
              vault_id={vault_id}
            />
          </div>
        </ConditionRenderer>
        {/* Left sessions - start */}
        <div className="flex-1">
          {/* Overview */}
          <div className={cn(activeTab !== 0 && "hidden")}>
            <VaultAnalytics
              vault_id={vault_id}
              isDetailLoading={isDetailLoading}
              vault={vaultDetails}
            />
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
            <div className="mt-6" />
            <HelpfulInfo isDetailLoading={isDetailLoading} />
          </div>
          {/* Your Holdings */}
          <div className={cn(activeTab !== 1 && "hidden")}>
            <YourHoldings
              isDetailLoading={isDetailLoading}
              vault_id={vault_id}
              vault={vaultDetails}
              activeTab={activeTab}
            />
            <div className="mt-6" />
            <NdlpStatus
              isDetailLoading={isDetailLoading}
              vaultId={vault_id || ""}
            />
          </div>
          {/* Left sessions - end */}
        </div>
      </div>
    </PageContainer>
  );
};

export default VaultDetail;
