import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { FormatNumberByMetrics } from "@/components/vault-detail/sections/position-value/format-number-by-metrics";
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
import { BasicVaultDetailsType, VaultHoldingType } from "@/types/vault-config.types";
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
  const { unit, key: keyMetric } = useVaultMetricUnitStore(vault_id);
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);

  const ndlp_balance = useMemo(() => {
    return lpToken?.balance || "0";
  }, [lpToken?.balance]);

  const {
    data,
    isLoading: isLoadingHolding,
    refetch,
  } = useUserHolding(vault_id, ndlp_balance, isAuthenticated);

  const fallbackHolding = useMemo(() => {
    const collateralToken = vault?.collateral_token_symbol || "";
    const collateralDecimals = vault?.collateral_token_decimals || 0;
    const collateralDisplay = vault?.collateral_token_display_name || "";
    const ndlpDecimals = vault?.vault_lp_token_decimals || 0;

    return {
      vault_id,
      user_vault_tokens: vault?.tokens?.map((token) => ({
        token_symbol: token?.token_symbol || "",
        token_address: token?.token_address || "",
        amount: "0",
        decimals: token?.decimal || 0,
        amount_usd: "0",
      })) || [],
      user_vault_rewards:
        vault?.tokens?.map((token) => ({
          token_symbol: token?.token_symbol || "",
          token_address: token?.token_address || "",
          claimable_amount: "0",
          claimable_amount_usd: "0",
        })) || [],
      ndlp_balance: "0",
      ndlp_balance_usd: "0",
      ndlp_price_usd: 0,
      ndlp_price_token: 0,
      ndlp_price_collateral: 0,
      ndlp_price_reward: 0,
      ndlp_price_token_usd: 0,
      ndlp_price_collateral_usd: 0,
      ndlp_price_reward_usd: 0,
      token_symbol: collateralToken,
      token_display_name: collateralDisplay,
      token_decimals: collateralDecimals,
      ndlp_decimals: ndlpDecimals,
      total_deposit_usd: 0,
      total_deposit_token: 0,
      pending_withdraw_ndlp: "0",
      pending_withdraw_token: 0,
      pending_withdraw_usd: 0,
      net_pnl_usd: 0,
      net_pnl_token: 0,
      net_pnl_collateral: 0,
      net_pnl_reward: 0,
      net_pnl_usd_percent: 0,
      net_pnl_token_percent: 0,
      net_pnl_collateral_percent: 0,
      net_pnl_reward_percent: 0,
      realized_pnl_usd: 0,
      realized_pnl_token: 0,
      realized_pnl_collateral: 0,
      realized_pnl_reward: 0,
      realized_pnl_usd_percent: 0,
      realized_pnl_token_percent: 0,
      realized_pnl_collateral_percent: 0,
      realized_pnl_reward_percent: 0,
      unrealized_pnl_usd: 0,
      unrealized_pnl_token: 0,
      unrealized_pnl_collateral: 0,
      unrealized_pnl_reward: 0,
      unrealized_pnl_usd_percent: 0,
      unrealized_pnl_token_percent: 0,
      unrealized_pnl_collateral_percent: 0,
      unrealized_pnl_reward_percent: 0,
      cashflow_usd: 0,
      cashflow_token: 0,
      cashflow_collateral: 0,
      cashflow_reward: 0,
      cashflow_usd_percent: 0,
      cashflow_token_percent: 0,
      cashflow_collateral_percent: 0,
      cashflow_reward_percent: 0,
    } as VaultHoldingType;
  }, [vault, vault_id]);

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

  const holding = data ?? fallbackHolding;

  const totalLiquidityByUnit = useMemo(() => {
    return calculateUserHoldings(
      ndlp_balance,
      vault?.user_pending_withdraw_ndlp,
      vault?.vault_lp_token_decimals,
      holding?.[`ndlp_price_${keyMetric}`] || 0
    );
  }, [ndlp_balance, vault, holding, keyMetric]);


  useEffect(() => {
    if (activeTab === 1) {
      refetch();
    }
  }, [activeTab, refetch]);

  return (
    <DetailWrapper title="Position Value" isLoading={isLoading} loadingStyle="h-[200px] w-full">
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
          <SectionMultiCard data={holding} lpToken={lpToken} />
          <EstLPBreakdown data={holding} />
          <PnlBreakdown data={holding} />
          <Cashflow data={holding} />
        </div>
    </DetailWrapper>
  );
};

export default UserPositionValue;
