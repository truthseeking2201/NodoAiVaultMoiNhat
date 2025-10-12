import ConditionRenderer from "@/components/shared/condition-renderer.tsx";
import { useState, useEffect } from "react";
import DepositForm from "./deposit";
import { FormTabs } from "./tabs";
import WithdrawSection from "./withdraw/withdraw-vault-section.tsx";
import useWalletSilentConnected from "@/hooks/use-wallet-silent-connected.ts";
import { useHasWithdrawRequest } from "@/hooks/use-withdraw-vault";
import { useWallet } from "@/hooks";
import {
  addMissionDepositPrefillListener,
  MissionDepositPrefillDetail,
} from "@/lib/mission-events";
import {
  addDepositPortalListener,
  consumeDepositPortalRequest,
  type DepositPortalPayload,
} from "@/lib/deposit-portal";

const Form = ({ vault_id }: { vault_id: string }) => {
  const [tab, setTab] = useState<string>("deposit");
  const [prefillAmountUsd, setPrefillAmountUsd] = useState<number | null>(null);
  useWalletSilentConnected();
  const { address, isAuthenticated } = useWallet();
  const { data: has_withdraw_request } = useHasWithdrawRequest(
    vault_id,
    address,
    isAuthenticated
  );
  useEffect(() => {
    if (has_withdraw_request === true) {
      setTab("withdraw");
    }
  }, [has_withdraw_request]);

  useEffect(() => {
    const unsubscribe = addMissionDepositPrefillListener(
      (event: CustomEvent<MissionDepositPrefillDetail>) => {
        const amount = Number(event.detail?.amountUsd ?? 0);
        setTab("deposit");
        if (Number.isFinite(amount) && amount > 0) {
          setPrefillAmountUsd(amount);
        } else {
          setPrefillAmountUsd(null);
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const applyPortalRequest = (payload?: DepositPortalPayload | null) => {
      if (!payload) return;
      if (payload.vaultId && payload.vaultId !== vault_id) {
        return;
      }
      setTab("deposit");
      if (Number.isFinite(payload.amountUsd) && payload.amountUsd > 0) {
        setPrefillAmountUsd(payload.amountUsd);
      } else {
        setPrefillAmountUsd(null);
      }
    };

    applyPortalRequest(consumeDepositPortalRequest());

    const unsubscribe = addDepositPortalListener(
      (event: CustomEvent<DepositPortalPayload>) => {
        applyPortalRequest(event.detail);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [vault_id]);

  return (
    <div>
      <FormTabs tab={tab} setTab={setTab} />
      <div className="mt-4">
        <ConditionRenderer when={tab === "deposit"}>
          <DepositForm
            vault_id={vault_id}
            prefillAmountUsd={prefillAmountUsd}
            onPrefillHandled={() => setPrefillAmountUsd(null)}
          />
        </ConditionRenderer>

        <ConditionRenderer when={tab === "withdraw"}>
          <WithdrawSection vault_id={vault_id} />
        </ConditionRenderer>
      </div>
    </div>
  );
};

export default Form;
