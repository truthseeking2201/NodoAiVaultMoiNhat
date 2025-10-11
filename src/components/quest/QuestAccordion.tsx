import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeaderPill } from "@/components/ui/card-header-bar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Quest } from "@/lib/quest-types";
import { ChecklistItem, TimeProgress } from "@/components/quest/QuestRequirementChecklist";

const LOCK_REASON_COPY: Record<string, string> = {
  tier_not_unlocked: "Complete the previous quest to unlock.",
  wallet_not_connected: "Connect your wallet to unlock.",
  insufficient_threshold: "Balance below required threshold.",
  kyc_required: "KYC verification required.",
  other: "Requirement not met yet.",
};

const formatUsd = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "$—";

const statusPill = (quest: Quest) => {
  const lockCopy = LOCK_REASON_COPY[quest.lockedReason ?? "other"];

  switch (quest.state) {
    case "claimable":
      return <HeaderPill tone="success">Claimable</HeaderPill>;
    case "active":
      return <HeaderPill>In progress</HeaderPill>;
    case "completed":
      return <HeaderPill tone="success">Completed</HeaderPill>;
    case "failed":
      return <HeaderPill tone="warn">Failed</HeaderPill>;
    case "locked":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <HeaderPill tone="warn">Locked</HeaderPill>
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-[#12131A] text-white border border-white/10">
              <div className="text-xs leading-relaxed">{lockCopy}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    default:
      return <HeaderPill>Available</HeaderPill>;
  }
};

const helperCopy = (quest: Quest) => {
  switch (quest.state) {
    case "available":
      return "Tap Start to begin this quest.";
    case "active":
      return "Finish all requirements to unlock claiming.";
    case "claimable":
      return "Ready to claim your XP reward.";
    case "completed":
      return `Completed on ${quest.completedAt ? new Date(quest.completedAt).toLocaleString() : "—"}`;
    case "failed":
      return "Quest failed. You can restart when it unlocks again.";
    case "locked":
      return LOCK_REASON_COPY[quest.lockedReason ?? "other"];
    default:
      return "";
  }
};

const requirementContent = (quest: Quest) => {
  const runtime = quest.runtime ?? {};
  const requiredMsDefault =
    "holdHours" in quest ? quest.holdHours * 3_600_000 : 0;
  const holdRequiredMs = runtime.holdRequiredMs ?? requiredMsDefault;
  const depositMet = runtime.depositMet ?? false;
  const timerStarted = depositMet && !!quest.startedAt;
  const heldMs = timerStarted
    ? Math.max(0, Date.now() - Date.parse(quest.startedAt!))
    : 0;

  if (quest.kind === "deposit_and_hold") {
    const requiredDeposit = runtime.requiredDepositUsd ?? quest.minDepositUsd;
    return (
      <div className="space-y-3">
        <ChecklistItem
          ok={Boolean(quest.vaultIdRequired)}
          label={`Vault: ${quest.vaultIdRequired === "vault_usdc_sui" ? "USDC/SUI" : quest.vaultIdRequired}`}
        />
        <ChecklistItem
          ok={depositMet}
          label={`Deposit ≥ ${formatUsd(requiredDeposit)}`}
          sub={`Current balance: ${formatUsd(runtime.currentBalanceUsd)}`}
        />
        <TimeProgress
          ok={quest.state === "claimable"}
          heldMs={heldMs}
          requiredMs={holdRequiredMs}
          started={timerStarted}
        />
      </div>
    );
  }

  if (quest.kind === "hold_existing") {
    const holdTimerStarted = depositMet && !!quest.startedAt;
    const heldMsHold = holdTimerStarted
      ? Math.max(0, Date.now() - Date.parse(quest.startedAt!))
      : 0;
    return (
      <div className="space-y-3">
        <ChecklistItem
          ok={quest.vaultIdRequired === "any" || Boolean(quest.vaultIdRequired)}
          label={`Scope: ${quest.vaultIdRequired === "any" ? "Any vault" : quest.vaultIdRequired}`}
        />
        <ChecklistItem
          ok={depositMet}
          label={`Balance ≥ ${formatUsd(runtime.thresholdUsd ?? quest.holdThresholdUsd)}`}
          sub={`Current balance: ${formatUsd(runtime.currentBalanceUsd)}`}
        />
        <TimeProgress
          ok={quest.state === "claimable"}
          heldMs={heldMsHold}
          requiredMs={holdRequiredMs}
          started={holdTimerStarted}
        />
      </div>
    );
  }

  return null;
};

type Props = {
  items: Quest[];
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onGoDeposit: (id: string, amountUsd: number) => void;
};

export function QuestAccordion({ items, onStart, onClaim, onGoDeposit }: Props) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      forceTick((value) => value + 1);
    }, 1_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Accordion type="multiple" className="divide-y divide-white/10">
      {items.map((quest) => {
        const requiredDeposit = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
        const currentBalance = quest.runtime?.currentBalanceUsd ?? 0;
        const missingDeposit = Math.max(0, requiredDeposit - currentBalance);
        const suggestedDepositUsd = missingDeposit > 0 ? missingDeposit : requiredDeposit;

        return (
          <AccordionItem key={quest.id} value={quest.id} className="px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="min-w-0 truncate text-left text-white/90">
                  {quest.title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                    XP {quest.rewardXp.toLocaleString()}
                  </span>
                  {statusPill(quest)}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-white/80">
              <div className="space-y-4 text-sm">
                <div>{quest.description}</div>
                <div className="text-xs text-white/60">
                  {helperCopy(quest)}
                </div>
                <div className="space-y-3">
                  {quest.startedAt && (
                    <div className="text-xs text-white/55">
                      Started: {new Date(quest.startedAt).toLocaleString()}
                    </div>
                  )}
                  {quest.endAt && (
                    <div className="text-xs text-white/55">
                      Ends: {new Date(quest.endAt).toLocaleString()}
                    </div>
                  )}
                </div>
                {requirementContent(quest)}

                <div className="flex items-center justify-end gap-2">
                  {quest.state === "available" && (
                    <Button
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => onStart(quest.id)}
                    >
                      Start
                    </Button>
                  )}

                  {quest.kind === "deposit_and_hold" &&
                    (quest.state === "available" || quest.state === "active") && (
                      <Button
                        className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => {
                          if (quest.state === "available") {
                            onStart(quest.id);
                          }
                          onGoDeposit(quest.id, suggestedDepositUsd);
                        }}
                      >
                        Deposit {formatUsd(suggestedDepositUsd)}
                      </Button>
                    )}

                  {quest.state === "claimable" && (
                    <Button
                      className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => onClaim(quest.id)}
                    >
                      Claim Reward
                    </Button>
                  )}

                  {quest.state === "completed" && (
                    <span className="text-xs text-white/60">Completed ✓</span>
                  )}

                  {quest.state === "failed" && (
                    <span className="text-xs text-red-400">Failed — try again</span>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
