import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import Form from "../form";

const DepositWithdraw = ({
  vault_id,
  isDetailLoading,
}: {
  vault_id: string;
  isDetailLoading?: boolean;
}) => {
  return (
    <div
      id="manage-liquidity"
      className="transition-shadow duration-500 rounded-2xl"
    >
      <DetailWrapper
        title="Manage Liquidity"
        isLoading={isDetailLoading}
        loadingStyle="h-[520px] w-full"
      >
        <Form vault_id={vault_id} />
      </DetailWrapper>
    </div>
  );
};

export default DepositWithdraw;
