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

const LOCK_REASON_COPY: Record<string, string> = {
  tier_not_unlocked: "Complete the previous quest to unlock this one.",
  wallet_not_connected: "Connect your wallet to unlock this quest.",
  insufficient_threshold: "Your balance is below the required threshold.",
  kyc_required: "Complete KYC verification to unlock this quest.",
  other: "Requirement not met yet. Check back soon.",
};

const formatUsd = (value?: number) =>
  typeof value === "number" ? `$${value.toLocaleString()}` : "$—";

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString() : undefined;

const statePill = (quest: Quest) => {
  const pill =
    quest.state === "claimable" ? (
      <HeaderPill tone="success">Claimable</HeaderPill>
    ) : quest.state === "active" ? (
      <HeaderPill>In progress</HeaderPill>
    ) : quest.state === "completed" ? (
      <HeaderPill tone="success">Completed</HeaderPill>
    ) : quest.state === "failed" ? (
      <HeaderPill tone="warn">Failed</HeaderPill>
    ) : quest.state === "locked" ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <HeaderPill tone="warn">Locked</HeaderPill>
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1A1B21] border border-white/10 text-white max-w-xs">
            <div className="text-xs leading-relaxed">
              {LOCK_REASON_COPY[quest.lockedReason ?? "other"]}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <HeaderPill>Available</HeaderPill>
    );

  return pill;
};

const stateHelperCopy = (quest: Quest) => {
  switch (quest.state) {
    case "available":
      return "You can start this quest now.";
    case "active":
      return "Finish the requirement to move this quest to Claimable.";
    case "claimable":
      return "Claim your XP reward to complete the quest.";
    case "completed":
      return `Completed on ${formatDate(quest.completedAt) ?? "—"}.`;
    case "failed":
      return "This quest expired or failed. You can try again when it unlocks.";
    case "locked":
      return LOCK_REASON_COPY[quest.lockedReason ?? "other"];
    default:
      return "";
  }
};

export function QuestAccordion({
  items,
  onStart,
  onGoDeposit,
  onClaim,
}: {
  items: Quest[];
  onStart: (id: string) => void;
  onGoDeposit: (id: string, amountUsd: number) => void;
  onClaim: (id: string) => void;
}) {
  return (
    <Accordion type="multiple" className="divide-y divide-white/10">
      {items.map((quest) => {
        const requirement =
          quest.kind === "hold_days"
            ? `Hold ≥ ${formatUsd(
                ("holdThresholdUsd" in quest && quest.holdThresholdUsd) || 0
              )} for ${quest.holdDays} days`
            : `Deposit ≥ ${formatUsd(
                ("minDepositUsd" in quest && quest.minDepositUsd) || 0
              )}`;

        const startCopy = formatDate(quest.startedAt);
        const endCopy = formatDate(quest.endAt);

        return (
          <AccordionItem
            key={quest.id}
            value={quest.id}
            className="px-3 py-0 border-0"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="min-w-0 truncate text-left text-white/90">
                  {quest.title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                    XP {quest.rewardXp.toLocaleString()}
                  </span>
                  {statePill(quest)}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm text-white/70">
              <div className="space-y-3">
                <div>{quest.description}</div>
                <div className="text-xs text-white/60">
                  Requirement: {requirement}
                </div>
                <div className="text-xs text-white/55">
                  {startCopy && <span>Started: {startCopy}</span>}
                  {startCopy && endCopy && <span> • </span>}
                  {endCopy && <span>Ends: {endCopy}</span>}
                  {!startCopy && !endCopy && (
                    <span>Starts once you tap “Start”.</span>
                  )}
                </div>
                {quest.kind === "hold_days" && quest.progressPct !== undefined && (
                  <div className="flex flex-col gap-1 text-xs text-white/60">
                    <span>
                      Progress: {Math.round(quest.progressPct)}% • Hold{" "}
                      {quest.holdDays} days at ≥{" "}
                      {formatUsd(quest.holdThresholdUsd)}
                    </span>
                  </div>
                )}
                <div className="text-xs text-white/60">
                  {stateHelperCopy(quest)}
                </div>

                <div className="flex items-center justify-end gap-2">
                  {quest.state === "available" && (
                    <>
                      <Button
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                        onClick={() => onStart(quest.id)}
                      >
                        Start
                      </Button>
                      {quest.kind !== "hold_days" && "minDepositUsd" in quest && (
                        <Button
                          className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                          onClick={() =>
                            onGoDeposit(quest.id, quest.minDepositUsd)
                          }
                        >
                          Deposit {formatUsd(quest.minDepositUsd)}
                        </Button>
                      )}
                    </>
                  )}
                  {quest.state === "active" &&
                    quest.kind !== "hold_days" &&
                    "minDepositUsd" in quest && (
                      <Button
                        className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        onClick={() =>
                          onGoDeposit(quest.id, quest.minDepositUsd)
                        }
                      >
                        Go to Deposit
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
                    <span className="text-xs text-red-400">
                      Failed — try again
                    </span>
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
