import { useCallback, useEffect, useState } from "react";
import { questMockService } from "@/data/quest-mocks";
import type { Quest } from "@/lib/quest-types";

const service = questMockService();

export function useQuest() {
  const [list, setList] = useState<Quest[]>(service.list());

  const sync = useCallback(() => {
    setList(service.list());
  }, []);

  const start = useCallback(
    (id: Quest["id"]) => {
      service.start(id);
      sync();
    },
    [sync]
  );

  const claim = useCallback(
    (id: Quest["id"]) => {
      service.claim(id);
      sync();
    },
    [sync]
  );

  const markDepositConfirmed = useCallback(
    (amountUsd: number) => {
      service.onDepositConfirmed(amountUsd);
      sync();
    },
    [sync]
  );

  useEffect(() => {
    setList(service.list());
  }, []);

  return {
    list,
    start,
    claim,
    markDepositConfirmed,
    refresh: sync,
  };
}
