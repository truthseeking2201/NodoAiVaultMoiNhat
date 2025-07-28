import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { BasicVaultDetailsType } from "@/types/vault-config.types";

type VaultInfoProps = {
  vault: BasicVaultDetailsType;
  isDetailLoading: boolean;
};

const StrategyExplanation = ({ vault, isDetailLoading }: VaultInfoProps) => {
  const pair = vault?.pool?.pool_name?.split("-") || [];

  return (
    <DetailWrapper
      title="Strategy Explaination"
      isLoading={isDetailLoading}
      loadingStyle="h-[134px] w-full"
    >
      <p className="text-white !mb-0">
        This vault maintains a balanced approach to liquidity provision on{" "}
        {pair[0]}/{pair[1]}, using AI to predict optimal rebalancing times while
        minimizing impermanent loss. The strategy focuses on sustainable yields
        with controlled risk exposure.
      </p>
    </DetailWrapper>
  );
};

export default StrategyExplanation;
