import { useCallback, useEffect, useState } from "react";
import { questService } from "@/data/quest-mocks";
import type { DepositQuest } from "@/lib/quest-state";

const service = questService();

export function useQuest() {
  const [list, setList] = useState<DepositQuest[]>(service.list());

  const sync = useCallback(() => {
    setList(service.list());
  }, []);

  const start = useCallback(
    (id: DepositQuest["id"]) => {
      service.start(id);
      sync();
    },
    [sync]
  );

  const claim = useCallback(
    (id: DepositQuest["id"]) => {
      service.claim(id);
      sync();
    },
    [sync]
  );

  useEffect(() => {
    const handleDepositConfirmed = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      const amountUsd = detail?.amountUsd;
      if (typeof amountUsd === "number" && amountUsd > 0) {
        service.onDepositConfirmed(amountUsd);
        sync();
      }
    };

    window.addEventListener(
      "deposit:confirmed",
      handleDepositConfirmed as EventListener
    );
    return () => {
      window.removeEventListener(
        "deposit:confirmed",
        handleDepositConfirmed as EventListener
      );
    };
  }, [sync]);

  return {
    list,
    start,
    claim,
  };
}
