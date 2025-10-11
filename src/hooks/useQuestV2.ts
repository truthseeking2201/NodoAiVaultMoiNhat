import { useEffect, useState } from "react";
import { questMockServiceV2 } from "@/data/quest-mocks";
import type { Quest } from "@/lib/quest-types";

const service = questMockServiceV2();

export function useQuestV2() {
  const [quests, setQuests] = useState<Quest[]>(() => service.list());

  const refresh = () => {
    setQuests(service.list());
  };

  useEffect(() => {
    refresh();

    const handleDeposit = (event: Event) => {
      const detail = (event as CustomEvent)?.detail ?? {};
      const vaultId = detail.vaultId as string | undefined;
      const amountUsd = Number(detail.amountUsd ?? 0);
      if (!vaultId || Number.isNaN(amountUsd)) return;
      service.onDepositConfirmed(vaultId, amountUsd);
      refresh();
    };

    const handleWithdraw = (event: Event) => {
      const detail = (event as CustomEvent)?.detail ?? {};
      const vaultId = detail.vaultId as string | undefined;
      const amountUsd = Number(detail.amountUsd ?? 0);
      if (!vaultId || Number.isNaN(amountUsd)) return;
      service.onWithdrawConfirmed(vaultId, amountUsd);
      refresh();
    };

    window.addEventListener("deposit:confirmed", handleDeposit as EventListener);
    window.addEventListener("withdraw:confirmed", handleWithdraw as EventListener);

    return () => {
      window.removeEventListener(
        "deposit:confirmed",
        handleDeposit as EventListener
      );
      window.removeEventListener(
        "withdraw:confirmed",
        handleWithdraw as EventListener
      );
    };
  }, []);

  return {
    quests,
    start: (id: string) => {
      service.start(id);
      refresh();
    },
    claim: (id: string) => {
      service.claim(id);
      refresh();
    },
    refresh,
  };
}
