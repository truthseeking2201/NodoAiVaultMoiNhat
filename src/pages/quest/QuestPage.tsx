import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import QuestSummaryCard from "@/components/quest/cards/QuestSummaryCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HeaderPill } from "@/components/ui/card-header-bar";
import { PATH_ROUTER, getPathVaultDetail } from "@/config/router";
import { useQuest } from "../../hooks/useQuest";
import { setDepositIntent } from "@/lib/deposit-intent";
import { DepositQuest } from "@/lib/quest-state";
import { useGetDepositVaults } from "@/hooks";

const statusPill = (state: DepositQuest["state"]) => {
  switch (state) {
    case "claimable":
      return <HeaderPill tone="success">Claimable</HeaderPill>;
    case "active":
      return <HeaderPill>In progress</HeaderPill>;
    case "completed":
      return <HeaderPill tone="success">Completed</HeaderPill>;
    case "failed":
      return <HeaderPill tone="warn">Failed</HeaderPill>;
    case "locked":
      return <HeaderPill tone="warn">Locked</HeaderPill>;
    default:
      return <HeaderPill>Available</HeaderPill>;
  }
};

const STATE_ORDER: Record<DepositQuest["state"], number> = {
  claimable: 0,
  active: 1,
  available: 2,
  locked: 3,
  completed: 4,
  failed: 5,
};

export default function QuestPage() {
  const { list, start, claim } = useQuest();
  const { data: depositVaults } = useGetDepositVaults();
  const navigate = useNavigate();

  const totalXpEarned = useMemo(
    () =>
      list
        .filter((quest) => quest.state === "completed")
        .reduce((sum, quest) => sum + quest.rewardXp, 0),
    [list]
  );

  const sortedQuests = useMemo(() => {
    return [...list].sort((a, b) => {
      const byState = STATE_ORDER[a.state] - STATE_ORDER[b.state];
      if (byState !== 0) {
        return byState;
      }
      return a.minDepositUsd - b.minDepositUsd;
    });
  }, [list]);

  const defaultVaultId = depositVaults?.[0]?.vault_id;

  const handleDepositNavigation = (quest: DepositQuest) => {
    const targetVaultId = quest.targetVaultId ?? defaultVaultId;
    setDepositIntent({
      source: "quest",
      questId: quest.id,
      amountUsd: quest.minDepositUsd,
      vaultId: targetVaultId,
    });

    if (targetVaultId) {
      navigate(getPathVaultDetail(targetVaultId));
    } else {
      navigate(PATH_ROUTER.VAULTS);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <QuestSummaryCard totalXp={totalXpEarned} />

      <div className="glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm">
        <div className="flex h-12 items-center px-5 text-[15px] font-medium text-white/90 bg-white/8 border-b border-white/10">
          Quests
        </div>

        <div className="p-2">
          <Accordion type="multiple" className="divide-y divide-white/10">
            {sortedQuests.map((quest) => (
              <AccordionItem
                key={quest.id}
                value={quest.id}
                className="rounded-none border-0 px-3"
              >
                <AccordionTrigger className="py-3">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="min-w-0 truncate text-left text-white/90">
                      {quest.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                        XP {quest.rewardXp.toLocaleString()}
                      </span>
                      {statusPill(quest.state)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-white/70">
                  <div className="space-y-4">
                    <div className="text-sm">
                      Requirement: deposit ≥ ${quest.minDepositUsd.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {quest.state === "available" && (
                        <>
                          <Button
                            variant="outline"
                            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => start(quest.id)}
                          >
                            Start
                          </Button>
                          <Button
                            className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                            onClick={() => handleDepositNavigation(quest)}
                          >
                            Deposit ${quest.minDepositUsd.toLocaleString()}
                          </Button>
                        </>
                      )}
                      {quest.state === "active" && (
                        <Button
                          className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => handleDepositNavigation(quest)}
                        >
                          Go to Deposit
                        </Button>
                      )}
                      {quest.state === "claimable" && (
                        <Button
                          className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => claim(quest.id)}
                        >
                          Claim Reward
                        </Button>
                      )}
                      {quest.state === "completed" && (
                        <span className="text-xs text-white/60">Completed ✓</span>
                      )}
                      {quest.state === "failed" && (
                        <span className="text-xs text-red-400">
                          Failed — try again
                        </span>
                      )}
                      {quest.state === "locked" && (
                        <span className="text-xs text-white/60">
                          Unlock earlier quests to access this reward.
                        </span>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
