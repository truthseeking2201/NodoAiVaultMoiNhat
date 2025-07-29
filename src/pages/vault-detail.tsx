import DetailsBackground from "@/assets/images/bg-details.webp";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import DepositWithdraw from "@/components/vault-detail/sessions/deposit-withdraw";
import HeaderDetail from "@/components/vault-detail/sessions/header-detail";
import HelpfulInfo from "@/components/vault-detail/sessions/helpful-info";
import StrategyExplanation from "@/components/vault-detail/sessions/strategy-explanation";
import VaultActivities from "@/components/vault-detail/sessions/vault-activities";
import VaultAnalytics from "@/components/vault-detail/sessions/vault-analytics";
import VaultInfo from "@/components/vault-detail/sessions/vault-info";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { useGetDepositVaults, useVaultBasicDetails } from "@/hooks";
import { formatAmount } from "@/lib/utils";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const VaultDetail = () => {
  const { vault_id } = useParams();
  const { data: vaultDetails, isLoading: isLoadingVaultDetails } =
    useVaultBasicDetails(vault_id);

  const {
    data: depositVaults,
    isLoading: isLoadingDepositVaults,
    isFetching: isFetchingDepositVaults,
  } = useGetDepositVaults();

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
  const { refetch: refetchDepositVaults } = useGetDepositVaults();

  const handleBackToHome = () => {
    refetchDepositVaults();    
    navigate("/", { replace: true });
  };

  const vaultInfo = useMemo(() => {
    return [
      {
        label: "APY",
        // tooltip: [
        //   {
        //     label: "DEX APR",
        //     value: !isLoadingVaultDetails
        //       ? formatAmount({
        //           amount: vaultDetails?.pool_apr,
        //         })
        //       : "--",
        //     suffix: "%",
        //   },
        //   {
        //     label: "NODO APR",
        //     value: !isLoadingVaultDetails
        //       ? formatAmount({
        //           amount: vaultDetails?.vault_apr,
        //         })
        //       : "--",
        //     suffix: "%",
        //   },
        //   {
        //     label: "NODO APY",
        //     value: !isLoadingVaultDetails
        //       ? formatAmount({
        //           amount: vaultDetails?.vault_apy,
        //         })
        //       : "--",
        //     suffix: "%",
        //   },
        // ],
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.vault_apy,
            })
          : "--",
        suffix: "%",
      },
      {
        label: "TVL",
        tooltip: [
          {
            label: "DEX TVL",
            value: !isLoadingVaultDetails
              ? formatAmount({
                  amount: vaultDetails?.pool_total_value_usd,
                })
              : "--",
            prefix: "$",
          },
          {
            label: "NODO TVL",
            value: !isLoadingVaultDetails
              ? formatAmount({
                  amount: vaultDetails?.total_value_usd,
                })
              : "--",
            prefix: "$",
          },
          {
            label: "NODO Shares",
            value: !isLoadingVaultDetails
              ? formatAmount({
                  amount: vaultDetails?.nodo_share,
                })
              : "--",
            suffix: "%",
          },
        ],
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.total_value_usd,
            })
          : "--",
        prefix: "$",
      },
      // {
      //   label: "24h Rewards",
      //   tooltip: [
      //     {
      //       label: "Daily Rate",
      //       value: !isLoadingVaultDetails
      //         ? formatAmount({
      //             amount: vaultDetails?.rewards_24h_daily_rate,
      //           })
      //         : "--",
      //       suffix: "%",
      //     },
      //   ],
      //   value: !isLoadingVaultDetails
      //     ? formatAmount({
      //         amount: vaultDetails?.rewards_24h_usd,
      //       })
      //     : "--",
      //   prefix: "$",
      // },
      {
        label: "NDLP Price",
        tooltip: [
          {
            label: "7D % Change",
            value: !isLoadingVaultDetails
              ? formatAmount({
                  amount: vaultDetails?.ndlp_price_change_7d,
                })
              : "--",
            suffix: "%",
            isHighlighted: true,
            isIncreasing: vaultDetails?.ndlp_price_change_7d > 0,
          },
        ],
        value: !isLoadingVaultDetails
          ? formatAmount({
              amount: vaultDetails?.ndlp_price,
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
  };

  return (
    <PageContainer backgroundImage={DetailsBackground} className="py-6">
      <Button
        variant="outline"
        className="mb-4 border-white/30 text-sm"
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
      <div className="flex gap-8 mb-[76px]">
        {/* Left sessions */}
        <div className="flex-1">
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
    </PageContainer>
  );
};

export default VaultDetail;
