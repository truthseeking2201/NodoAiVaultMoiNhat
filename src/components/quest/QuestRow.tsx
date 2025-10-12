import clsx from "clsx";
import type { Quest } from "@/lib/quest-types";
import { Button } from "@/components/ui/button";

type QuestRowProps = {
  q: Quest;
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onDeposit: (id: string, amountUsd: number) => void;
};

const formatUsd = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "$—";

const xpTone = (rewardXp: number) => {
  if (rewardXp <= 3_000) return "text-emerald-300";
  if (rewardXp <= 6_000) return "text-cyan-300";
  if (rewardXp <= 10_000) return "text-purple-300";
  return "text-amber-300";
};

const getStatusPill = (state: Quest["state"]) => {
  switch (state) {
    case "claimable":
      return {
        label: "CLAIMABLE",
        cls: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
      };
    case "active":
      return {
        label: "IN PROGRESS",
        cls: "bg-cyan-500/10 text-cyan-300 border border-cyan-400/30",
      };
    case "available":
      return {
        label: "AVAILABLE",
        cls: "bg-white/10 text-white/70 border border-white/18",
      };
    case "completed":
      return {
        label: "COMPLETED",
        cls: "bg-white/10 text-white/65 border border-white/18",
      };
    case "failed":
      return {
        label: "FAILED",
        cls: "bg-rose-500/10 text-rose-300 border border-rose-400/30",
      };
    default:
      return {
        label: "LOCKED",
        cls: "bg-white/10 text-white/60 border border-white/18",
      };
  }
};

const questDurationCopy = (quest: Quest) => {
  const hours = quest.holdHours ?? 0;
  if (!hours) return null;
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `Hold for ${days} day${days > 1 ? "s" : ""}`;
  }
  return `Hold for ${hours}h`;
};

const questRequirementCopy = (quest: Quest) => {
  if (quest.kind === "deposit_and_hold") {
    const required = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
    return `Deposit ≥ ${formatUsd(required)}`;
  }
  if (quest.kind === "hold_existing") {
    const threshold =
      quest.runtime?.thresholdUsd ?? quest.holdThresholdUsd ?? 0;
    return `Balance ≥ ${formatUsd(threshold)}`;
  }
  return null;
};

const questVaultCopy = (quest: Quest) => {
  if (!quest.vaultIdRequired) return null;
  if (quest.vaultIdRequired === "any") return "Vault: Any";
  if (quest.vaultIdRequired === "vault_usdc_sui") return "Vault: USDC/SUI";
  if (quest.vaultIdRequired === "vault_usdt_sui") return "Vault: USDT/SUI";
  if (quest.vaultIdRequired === "vault_sui") return "Vault: SUI";
  return `Vault: ${quest.vaultIdRequired}`;
};

const computeProgressPct = (quest: Quest) => {
  if (quest.state === "claimable") {
    return 100;
  }
  const requiredMs = quest.runtime?.holdRequiredMs;
  const accumulatedMs = quest.runtime?.holdAccumulatedMs;
  if (
    quest.state === "active" &&
    typeof requiredMs === "number" &&
    requiredMs > 0 &&
    typeof accumulatedMs === "number"
  ) {
    return Math.min(
      100,
      Math.max(0, Math.round((accumulatedMs / requiredMs) * 100))
    );
  }
  if (quest.state === "active" && quest.startedAt && quest.endAt) {
    const start = Date.parse(quest.startedAt);
    const end = Date.parse(quest.endAt);
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      const now = Date.now();
      const pct = Math.round(((now - start) * 100) / (end - start));
      return Math.min(100, Math.max(0, pct));
    }
  }
  return null;
};

const getProgressVisual = (quest: Quest) => {
  const pct = computeProgressPct(quest);
  if (pct == null) {
    if (quest.state === "claimable") {
      return {
        pct: 100,
        label: "Ready to claim",
        barClass: "bg-emerald-400/80",
      };
    }
    return null;
  }

  if (quest.state === "claimable") {
    return {
      pct: 100,
      label: "Ready to claim",
      barClass: "bg-emerald-400/80",
    };
  }

  if (quest.state !== "active") {
    return null;
  }

  let label = "Progress";
  let barClass = "bg-white/30";
  if (pct <= 0) {
    label = "Not started";
    barClass = "bg-white/20";
  } else if (pct < 34) {
    label = "Warming up…";
    barClass = "bg-cyan-400/70";
  } else if (pct < 67) {
    label = "Holding steady…";
    barClass = "bg-purple-400/70";
  } else if (pct < 100) {
    label = "Almost there…";
    barClass = "bg-amber-400/70";
  } else {
    label = "Completed";
    barClass = "bg-emerald-400/80";
  }

  return {
    pct,
    label,
    barClass,
  };
};

const getDepositAmount = (quest: Quest) =>
  quest.kind === "deposit_and_hold"
    ? quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd
    : undefined;

export function QuestRow({ q, onStart, onClaim, onDeposit }: QuestRowProps) {
  const status = getStatusPill(q.state);
  const xpClass = xpTone(q.rewardXp);
  const vault = questVaultCopy(q);
  const requirement = questRequirementCopy(q);
  const duration = questDurationCopy(q);
  const progress = getProgressVisual(q);
  const depositAmount = getDepositAmount(q);

  const handlePrimaryAction = () => {
    if (q.state === "claimable") {
      onClaim(q.id);
      return;
    }

    if (q.state === "available") {
      onStart(q.id);
      if (depositAmount != null) {
        onDeposit(q.id, depositAmount);
      }
      return;
    }

    if (q.state === "active" && depositAmount != null) {
      onDeposit(q.id, depositAmount);
    }
  };

  const primaryAction =
    q.state === "claimable"
      ? { label: "Claim XP", tone: "claim" as const }
      : q.state === "available" && depositAmount != null
        ? { label: "Start & Deposit", tone: "primary" as const }
        : q.state === "available"
          ? { label: "Start Quest", tone: "primary" as const }
          : q.state === "active" && depositAmount != null
            ? { label: "Manage Deposit", tone: "secondary" as const }
            : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className={clsx("text-[12px] px-2 py-0.5 rounded-full", status.cls)}>
              {status.label}
            </span>
            <span
              className={clsx(
                "text-[12px] px-2 py-0.5 rounded-full border border-white/12 bg-white/6",
                xpClass
              )}
            >
              XP {q.rewardXp.toLocaleString()}
            </span>
          </div>

          <div className="mt-2 text-[18px] font-semibold leading-tight text-white">
            {q.title}
          </div>
          <div className="mt-1 text-[13px] text-white/65">
            {q.description}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-white/75">
            {vault ? (
              <span className="px-2 py-0.5 rounded-full border border-white/12 bg-white/6">
                {vault}
              </span>
            ) : null}
            {requirement ? (
              <span className="px-2 py-0.5 rounded-full border border-white/12 bg-white/6">
                {requirement}
              </span>
            ) : null}
            {duration ? (
              <span className="px-2 py-0.5 rounded-full border border-white/12 bg-white/6">
                {duration}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 md:shrink-0">
          {primaryAction ? (
            <Button
              className={clsx(
                primaryAction.tone === "claim" &&
                  "border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
                primaryAction.tone === "primary" &&
                  "border border-white/18 bg-white/10 text-white hover:bg-white/18",
                primaryAction.tone === "secondary" &&
                  "border border-white/18 bg-white/8 text-white hover:bg-white/16"
              )}
              onClick={handlePrimaryAction}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </div>
      </div>

      {progress ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-white/55">
            <span>{progress.label}</span>
            <span>{progress.pct}%</span>
          </div>
          <div className="mt-1 h-[2px] rounded-full bg-white/12">
            <div
              className={clsx("h-full rounded-full", progress.barClass)}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
