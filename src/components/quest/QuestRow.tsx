import clsx from "clsx";
import type { Quest } from "@/lib/quest-types";
import { Button } from "@/components/ui/button";

type QuestRowProps = {
  quest: Quest;
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onDeposit: (id: string, amountUsd?: number) => void;
};

const formatUsd = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "$—";

const xpTone = (rewardXp: number) => {
  if (rewardXp <= 3_000) return "text-emerald-300";
  if (rewardXp <= 6_000) return "text-cyan-300";
  if (rewardXp <= 10_000) return "text-purple-300";
  return "text-amber-300";
};

const statusMeta = (quest: Quest) => {
  switch (quest.state) {
    case "claimable":
      return {
        label: "Claimable",
        className:
          "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
      };
    case "active":
      return {
        label: "In Progress",
        className:
          "bg-cyan-500/10 text-cyan-300 border border-cyan-400/30",
      };
    case "available":
      return {
        label: "Available",
        className: "bg-white/10 text-white/75 border border-white/20",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-white/10 text-white/70 border border-white/20",
      };
    case "failed":
      return {
        label: "Failed",
        className: "bg-rose-500/10 text-rose-300 border border-rose-400/30",
      };
    default:
      return {
        label: "Locked",
        className: "bg-white/10 text-white/60 border border-white/20",
      };
  }
};

const holdDurationCopy = (quest: Quest) => {
  const hours = quest.holdHours;
  if (!hours) return null;
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `Hold for ${days} day${days > 1 ? "s" : ""}`;
  }
  return `Hold for ${hours}h`;
};

const requirementCopy = (quest: Quest) => {
  if (quest.kind === "deposit_and_hold") {
    const required = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
    return `Deposit ≥ ${formatUsd(required)}`;
  }
  if (quest.kind === "hold_existing") {
    const threshold = quest.runtime?.thresholdUsd ?? quest.holdThresholdUsd;
    return `Balance ≥ ${formatUsd(threshold)}`;
  }
  return null;
};

const progressPercent = (quest: Quest) => {
  if (quest.state !== "active") return null;
  const required = quest.runtime?.holdRequiredMs;
  const accumulated = quest.runtime?.holdAccumulatedMs;
  if (
    typeof required === "number" &&
    required > 0 &&
    typeof accumulated === "number"
  ) {
    return Math.min(100, Math.round((accumulated / required) * 100));
  }
  return null;
};

const vaultLabel = (quest: Quest) => {
  if (!quest.vaultIdRequired) return null;
  if (quest.vaultIdRequired === "any") return "Vault: Any";
  if (quest.vaultIdRequired === "vault_usdc_sui") return "Vault: USDC/SUI";
  if (quest.vaultIdRequired === "vault_usdt_sui") return "Vault: USDT/SUI";
  if (quest.vaultIdRequired === "vault_sui") return "Vault: SUI";
  return `Vault: ${quest.vaultIdRequired}`;
};

export function QuestRow({ quest, onStart, onClaim, onDeposit }: QuestRowProps) {
  const status = statusMeta(quest);
  const xpClass = xpTone(quest.rewardXp);
  const duration = holdDurationCopy(quest);
  const requirement = requirementCopy(quest);
  const progress = progressPercent(quest);
  const depositAmount =
    quest.kind === "deposit_and_hold"
      ? quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd
      : undefined;

  const vault = vaultLabel(quest);

  const showStart = quest.state === "available";
  const showDepositButton =
    quest.kind === "deposit_and_hold" &&
    (quest.state === "available" || quest.state === "active");

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                "inline-flex min-w-[90px] items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                status.className
              )}
            >
              {status.label}
            </span>
            <span
              className={clsx(
                "inline-flex items-center rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                xpClass
              )}
            >
              XP {quest.rewardXp.toLocaleString()}
            </span>
          </div>
          <div className="truncate text-sm font-semibold text-white sm:text-base">
            {quest.title}
          </div>
          <div className="text-xs text-white/55 sm:text-[13px]">
            {quest.description}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-white/70">
            {vault ? (
              <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5">
                {vault}
              </span>
            ) : null}
            {requirement ? (
              <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5">
                {requirement}
              </span>
            ) : null}
            {duration ? (
              <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5">
                {duration}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {showStart ? (
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => onStart(quest.id)}
            >
              Start
            </Button>
          ) : null}
          {showDepositButton ? (
            <Button
              className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={() => onDeposit(quest.id, depositAmount)}
            >
              {quest.state === "available"
                ? `Deposit ${formatUsd(depositAmount)}`
                : "Manage Deposit"}
            </Button>
          ) : null}
          {quest.state === "claimable" ? (
            <Button
              className="border border-emerald-400/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
              onClick={() => onClaim(quest.id)}
            >
              Claim XP
            </Button>
          ) : null}
        </div>
      </div>

      {progress != null ? (
        <div className="mt-3">
          <div className="h-[2px] w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400/80 to-purple-300/60"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-white/50">
            {progress}% complete
          </div>
        </div>
      ) : null}
    </div>
  );
}
