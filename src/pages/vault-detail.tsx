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
import UserPositionValue from "@/components/vault-detail/sections/user-position-value";
import VaultStreak from "@/components/vault-detail/sections/vault-streak";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { PATH_ROUTER } from "@/config/router";
import { useStreak } from "@/features/streak-vault/hooks/use-streak";
import {
  useGetDepositVaults,
  useGetLpToken,
  useVaultBasicDetails,
  useVaultMetricUnitStore,
} from "@/hooks";
import { useWallet } from "@/hooks/use-wallet";
import { cn, formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType, VaultApr } from "@/types/vault-config.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import UnderlineTabs from "@/components/ui/underline-tab";
import MyNdlpStatus from "@/components/vault-detail/sections/my-ndlp-status";
import CollateralUnit from "@/components/vault-detail/sections/collateral-unit";
import VaultNdlpStatus from "@/components/vault-detail/sections/vault-ndlp-status";
import { formatCollateralUsdNumber } from "@/components/vault-detail/helpers";
import ApyTooltipContent from "@/components/vault/list/apy-tooltip-content";
import BigNumber from "bignumber.js";
import { LpSimulatorCard } from "@/components/vault-detail/simulator/lp-simulator-card";
import { LpSimulatorModal } from "@/components/vault-detail/simulator/lp-simulator-modal";
import { LpSimulatorMobileCTA } from "@/components/vault-detail/simulator/lp-simulator-mobile-cta";
import { useLpSimulatorStore, ensureSimulatorInput } from "@/hooks/use-lp-simulator";
import { isMockMode } from "@/config/mock";

export type VaultInfo = {
  label: string;
  value: string;
  prefix?: string | JSX.Element;
  suffix?: string;
  tooltip?: any;
  tooltipClassName?: string;
};

const VaultDetail = () => {
  const { vault_id } = useParams();
  const { data: vaultDetails, isLoading: isLoadingVaultDetails } =
    useVaultBasicDetails(vault_id);
  const { address } = useWallet();
  const { ensureSnapshotForToday } = useStreak(vault_id ?? "", address ?? undefined);
  const { isLg, isMd } = useBreakpoint();
  const setSimulatorDrawerOpen = useLpSimulatorStore((state) => state.setDrawerOpen);
  const markSimulatorOpen = useLpSimulatorStore((state) => state.markFirstOpen);
  const dismissSimulatorMobileCTA = useLpSimulatorStore((state) => state.dismissMobileCTA);
  const {
    data: depositVaults,
    isLoading: isLoadingDepositVaults,
    isFetching: isFetchingDepositVaults,
    refetch: refetchDepositVaults,
  } = useGetDepositVaults();
  const lpToken = useGetLpToken(vaultDetails?.vault_lp_token, vault_id);
  const lpBalance = lpToken?.balance ?? "0";
  const hasLPBalance = new BigNumber(lpBalance).gt(0);

  useEffect(() => {
    if (!isMockMode || !vault_id) {
      return;
    }
    if (new BigNumber(lpBalance).gt(0)) {
      ensureSnapshotForToday(true);
    }
  }, [lpBalance, ensureSnapshotForToday, vault_id]);

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

  const handleTabSwitch = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

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
    const formattedApy = formatAmount({
      amount: vaultDetails?.daily_compounding_apy || 0,
    });
    return [
      {
        label: "APY",
        tooltip: (
          <ApyTooltipContent
            {...({
              rolling_7day_apr: vaultDetails?.rolling_7day_apr || 0,
              nodo_incentive_apr: vaultDetails?.nodo_incentive_apr || 0,
              campaign_aprs: vaultDetails?.campaign_aprs || [],
              total_apr_precompounding:
                vaultDetails?.total_apr_precompounding || 0,
              daily_compounding_apy: vaultDetails?.daily_compounding_apy || 0,
              nodo_incentives: vaultDetails?.nodo_incentives || [],
            } as VaultApr)}
          />
        ),
        value: !isLoadingVaultDetails ? formattedApy : "--",
        suffix: "%",
        tooltipClassName: "md:min-w-[352px] w-full",
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

  useEffect(() => {
    ensureSimulatorInput(vault_id);
  }, [vault_id]);

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

  const enableSimulator = import.meta.env.VITE_ENABLE_IL_SIMULATOR === "true";

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
        vaultId={vault_id}
      />
      <ConditionRenderer when={!isBreakMobile}>
        <div className="md:p-3 max-md:mb-3 mb-4 flex justify-between">
          <UnderlineTabs
            activeTab={activeTab}
            labels={["Overview", "Your Holdings"]}
            labelClassName="max-md:text-base max-md:px-0"
            tabClassName="max-md:space-x-4"
            onActiveTabChange={handleTabSwitch}
          />
          <div className="flex items-center gap-3">
            <CollateralUnit
              collateralToken={vaultDetails?.collateral_token}
              vault_id={vault_id}
            />
            {enableSimulator && (
              <Button
                variant="outline"
                className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => {
                  if (vault_id) {
                    ensureSimulatorInput(vault_id);
                    markSimulatorOpen(vault_id);
                    dismissSimulatorMobileCTA(vault_id);
                  }
                  setSimulatorDrawerOpen(true);
                }}
              >
                Simulate IL
              </Button>
            )}
          </div>
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
            !isBreakMobile &&
              window.innerHeight > 900 &&
              "sticky top-[10px] self-start"
          )}
        >
          <div className="space-y-6">
            <DepositWithdraw
              vault_id={vault_id}
              isDetailLoading={isDetailLoading}
            />
            <div className="text-right text-xs text-white/60">
              Want rewards?{" "}
              <Link
                to={PATH_ROUTER.QUEST}
                className="text-white/80 underline-offset-2 hover:text-white"
              >
                See quests →
              </Link>
            </div>
          </div>
        </div>
        {/* Right sessions - end */}
        <ConditionRenderer when={isBreakMobile}>
          <div className="mt-4 mb-3 flex justify-between">
            <UnderlineTabs
              activeTab={activeTab}
              labels={["Overview", "Your Holdings"]}
              labelClassName="max-md:text-base max-md:px-0"
              tabClassName="max-md:space-x-4"
              onActiveTabChange={handleTabSwitch}
              key={activeTab}
            />
            <div className="flex items-center gap-2">
              <CollateralUnit
                collateralToken={vaultDetails?.collateral_token}
                vault_id={vault_id}
              />
              {enableSimulator && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    if (vault_id) {
                      ensureSimulatorInput(vault_id);
                      markSimulatorOpen(vault_id);
                      dismissSimulatorMobileCTA(vault_id);
                    }
                    setSimulatorDrawerOpen(true);
                  }}
                >
                  Simulate IL
                </Button>
              )}
            </div>
          </div>
        </ConditionRenderer>
        {/* Left sessions - start */}
        <div className="flex-1">
          {/* Overview */}
          <div className={cn(activeTab !== 0 && "hidden")}>
            <VaultNdlpStatus
              vaultId={vault_id}
              isDetailLoading={isDetailLoading}
            />
            <div className="mt-6" />
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
            {import.meta.env.VITE_APP_ENV !== "production" && (
              <>
                <MyNdlpStatus
                  isDetailLoading={isDetailLoading}
                  vaultId={vault_id}
                />
                <div className="mt-6" />
              </>
            )}

            {vault_id && (
              <>
                <VaultStreak
                  isDetailLoading={isDetailLoading}
                  vaultId={vault_id}
                  vault={vaultDetails}
                />
                <div className="mt-6" />
              </>
            )}

            <UserPositionValue
              isDetailLoading={isDetailLoading}
              vault_id={vault_id}
              vault={vaultDetails}
              activeTab={activeTab}
            />

            {vault_id && (
              <div className="mt-6">
                <LpSimulatorCard vaultId={vault_id} />
              </div>
            )}
          </div>
          {/* Left sessions - end */}
        </div>
      </div>
      <LpSimulatorModal vaultId={vault_id} />
      <LpSimulatorMobileCTA vaultId={vault_id} />
    </PageContainer>
  );
};

export default VaultDetail;
