import ConditionRenderer from "@/components/shared/condition-renderer";
import { useState } from "react";
import { METHOD_DEPOSIT } from "../../constant";
import SelectMethod from "../select-method";
import DcaStrategy from "./dca-strategy";
import SingleDepositForm from "./deposit-form";
import DualDepositForm from "./dual-deposit-form";
import { useVaultBasicDetails } from "@/hooks";

type DepositFormProps = {
  vault_id: string;
};

const DepositForm = ({ vault_id }: DepositFormProps) => {
  const { data: vault } = useVaultBasicDetails(vault_id);
  const isEnableDual = vault?.metadata?.is_enable_dual_token;

  const [depositMethod, setDepositMethod] = useState<
    (typeof METHOD_DEPOSIT)[keyof typeof METHOD_DEPOSIT]
  >(isEnableDual ? METHOD_DEPOSIT.DUAL : METHOD_DEPOSIT.SINGLE);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SelectMethod
          className="mb-0"
          value={depositMethod}
          isEnableDual={isEnableDual}
          onChange={setDepositMethod}
        />
        {depositMethod === METHOD_DEPOSIT.SINGLE && <DcaStrategy />}
      </div>
      <ConditionRenderer when={depositMethod === METHOD_DEPOSIT.SINGLE}>
        <SingleDepositForm vault_id={vault_id} />
      </ConditionRenderer>
      <ConditionRenderer when={depositMethod === METHOD_DEPOSIT.DUAL}>
        <DualDepositForm vault_id={vault_id} />
      </ConditionRenderer>
    </div>
  );
};

export default DepositForm;
