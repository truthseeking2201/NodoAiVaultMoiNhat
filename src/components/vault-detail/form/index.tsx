import ConditionRenderer from "@/components/shared/condition-renderer.tsx";
import { useState } from "react";
import DepositForm from "./deposit/deposit-form";
import { FormHeader } from "./header";
import { FormTabs } from "./tabs";
import WithdrawSection from "./withdraw/withdraw-vault-section.tsx";

const Form = ({ vault_id }: { vault_id: string }) => {
  const [tab, setTab] = useState<string>("deposit");
  return (
    <div>
      <FormHeader vault_id={vault_id} />
      <div className="mt-8" />
      <FormTabs tab={tab} setTab={setTab} />
      <div className="mt-8">
        <ConditionRenderer when={tab === "deposit"}>
          <DepositForm vault_id={vault_id} />
        </ConditionRenderer>

        <ConditionRenderer when={tab === "withdraw"}>
          <WithdrawSection vault_id={vault_id} />
        </ConditionRenderer>
      </div>
    </div>
  );
};

export default Form;
