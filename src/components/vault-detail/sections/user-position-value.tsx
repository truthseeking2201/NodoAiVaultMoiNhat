import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { FormatNumberByMetrics } from "@/components/vault-detail/sections/position-value/format-number-by-metrics";
import { UnSignedHolding } from "@/components/vault-detail/sections/position-value/un-signed-holding";
import { SectionMultiCard } from "@/components/vault-detail/sections/position-value/section-multi-card";
import { EstLPBreakdown } from "@/components/vault-detail/sections/position-value/est-lp-breakdown";
import { PnlBreakdown } from "@/components/vault-detail/sections/position-value/pnl-breakdown";
import { Cashflow } from "@/components/vault-detail/sections/position-value/cashflow";
import { useMemo, useEffect } from "react";

import {
  useGetLpToken,
  useUserHolding,
  useVaultMetricUnitStore,
  useWallet,
} from "@/hooks";
import { showFormatNumber } from "@/lib/number";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import {
  calculateUserHoldings,
  calculateTotalLiquidity,
} from "@/utils/helpers";

type UserPositionValueProps = {
  isDetailLoading: boolean;
  vault: BasicVaultDetailsType;
  vault_id: string;
  activeTab: number;
};

const UserPositionValue = ({
  isDetailLoading,
  vault,
  vault_id,
  activeTab,
}: UserPositionValueProps) => {
  const { isAuthenticated } = useWallet();
  const { unit, isUsd, key: keyMetric } = useVaultMetricUnitStore(vault_id);
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);

  const ndlp_balance = useMemo(() => {
    return lpToken?.balance || "0";
  }, [lpToken?.balance]);

  const {
    data,
    isLoading: isLoadingHolding,
    refetch,
  } = useUserHolding(vault_id, ndlp_balance, isAuthenticated);

  const isLoading = useMemo(() => {
    return isLoadingHolding || isDetailLoading;
  }, [isLoadingHolding, isDetailLoading]);

  const totalLiquidity = useMemo(() => {
    return calculateTotalLiquidity(
      ndlp_balance,
      vault?.user_pending_withdraw_ndlp,
      vault?.vault_lp_token_decimals
    );
  }, [ndlp_balance, vault]);

  const totalLiquidityByUnit = useMemo(() => {
    return calculateUserHoldings(
      ndlp_balance,
      vault?.user_pending_withdraw_ndlp,
      vault?.vault_lp_token_decimals,
      data?.[`ndlp_price_${keyMetric}`] || 0
    );
  }, [ndlp_balance, vault, data, keyMetric]);

  const hasDeposit = useMemo(() => {
    if (!isAuthenticated) return false;
    return totalLiquidityByUnit > 0;
  }, [isAuthenticated, totalLiquidityByUnit]);

  const netPNL = useMemo(() => {
    return data?.[`net_pnl_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  useEffect(() => {
    if (activeTab === 1) {
      refetch();
    }
  }, [activeTab, refetch]);

  return (
    <DetailWrapper
      title={hasDeposit ? "Position Value" : "Welcome to NODO Vault!"}
      isLoading={isLoading}
      loadingStyle="h-[200px] w-full"
    >
      <ConditionRenderer when={hasDeposit} fallback={<UnSignedHolding />}>
        <div className="flex flex-col gap-4">
          <section>
            <div className="font-sans text-sm font-semibold	text-white/60 uppercase">
              Total Liquidity
            </div>
            <div className="flex items-center mt-2">
              <img
                src={lpToken?.image_url}
                alt="NODOAIx Token"
                className="w-8 h-8 mr-2"
              />
              <span className="font-mono text-white text-3xl font-semibold">
                {showFormatNumber(totalLiquidity || 0, 2, 6)}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2 mt-2 max-sm:flex-col max-sm:gap-1 max-sm:items-start">
              <div className="flex items-center">
                <span className="mr-1 font-sans text-sm md:text-base text-white">
                  ~
                </span>
                <FormatNumberByMetrics
                  unit={unit}
                  number={totalLiquidityByUnit}
                  className="font-mono text-white text-base md:text-xl font-medium"
                  collateralClassName="md:w-5 md:h-5 w-4 h-4"
                />
              </div>
            </div>
          </section>
          {/*  */}
          <SectionMultiCard data={data} lpToken={lpToken} />
          <EstLPBreakdown data={data} />
          <PnlBreakdown data={data} />
          <Cashflow data={data} />
        </div>
      </ConditionRenderer>
    </DetailWrapper>
  );
};

export default UserPositionValue;
