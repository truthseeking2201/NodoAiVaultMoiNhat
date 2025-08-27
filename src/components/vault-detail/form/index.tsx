import ConditionRenderer from "@/components/shared/condition-renderer.tsx";
import { useState } from "react";
import DepositForm from "./deposit/deposit-form";
import { FormTabs } from "./tabs";
import WithdrawSection from "./withdraw/withdraw-vault-section.tsx";
import useWalletSilentConnected from "@/hooks/use-wallet-silent-connected.ts";

const Form = ({ vault_id }: { vault_id: string }) => {
  const [tab, setTab] = useState<string>("deposit");
  useWalletSilentConnected();

  return (
    <div>
      <FormTabs tab={tab} setTab={setTab} />
      <div className="mt-4">
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
