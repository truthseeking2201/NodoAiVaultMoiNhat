import { motion } from "framer-motion";
import clsx from "clsx";
import type { Quest } from "@/lib/quest-types";

type QuestCardProps = {
  quest: Quest;
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onDeposit: (quest: Quest, amountUsd: number) => void;
};

const xpGradient = (rewardXp: number) => {
  if (rewardXp <= 3_000) {
    return "from-emerald-400/40 to-emerald-200/10";
  }
  if (rewardXp <= 6_000) {
    return "from-cyan-400/40 to-cyan-200/10";
  }
  if (rewardXp <= 10_000) {
    return "from-purple-400/40 to-purple-200/10";
  }
  return "from-amber-400/40 to-amber-200/10";
};

const statusStyles: Record<
  Quest["state"],
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className: "border-white/15 bg-white/8 text-white/70",
  },
  active: {
    label: "In Progress",
    className: "border-cyan-400/35 bg-cyan-400/15 text-cyan-200",
  },
  claimable: {
    label: "Claimable",
    className: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  },
  completed: {
    label: "Completed",
    className: "border-purple-400/40 bg-purple-400/15 text-purple-200",
  },
  failed: {
    label: "Failed",
    className: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  },
  locked: {
    label: "Locked",
    className: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  },
};

const formatUsd = (value?: number) =>
  value != null ? `$${value.toLocaleString()}` : "$—";

const vaultMeta = (quest: Quest) => {
  if (!quest.vaultIdRequired || quest.vaultIdRequired === "any") {
    return { icon: "✨", label: "Any Vault" };
  }
  switch (quest.vaultIdRequired) {
    case "vault_usdc_sui":
      return { icon: "🌊", label: "USDC/SUI Vault" };
    case "vault_usdt_sui":
      return { icon: "💠", label: "USDT/SUI Vault" };
    case "vault_sui":
      return { icon: "⚡", label: "SUI Vault" };
    default:
      return { icon: "🔒", label: quest.vaultIdRequired };
  }
};

const buildRequirement = (quest: Quest) => {
  if (quest.kind === "deposit_and_hold") {
    const amount = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
    return `Deposit ≥ ${formatUsd(amount)}`;
  }
  const threshold = quest.runtime?.thresholdUsd ?? quest.holdThresholdUsd;
  return `Balance ≥ ${formatUsd(threshold)}`;
};

const buildDuration = (quest: Quest) => {
  const hours = quest.holdHours ?? 0;
  if (!hours) {
    return "Instant quest";
  }
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `Hold for ${days} day${days > 1 ? "s" : ""}`;
  }
  return `Hold for ${hours}h`;
};

const computeProgress = (quest: Quest) => {
  const required = quest.runtime?.holdRequiredMs;
  const accumulated = quest.runtime?.holdAccumulatedMs;
  if (
    typeof required === "number" &&
    required > 0 &&
    typeof accumulated === "number"
  ) {
    return Math.min(1, Math.max(0, accumulated / required));
  }
  return null;
};

export function QuestCard({ quest, onStart, onClaim, onDeposit }: QuestCardProps) {
  const { icon, label: vaultLabel } = vaultMeta(quest);
  const status = statusStyles[quest.state];
  const requirementCopy = buildRequirement(quest);
  const durationCopy = buildDuration(quest);
  const progress = computeProgress(quest);

  const showStart =
    quest.state === "available" && quest.kind === "hold_existing";
  const canDeposit =
    quest.kind === "deposit_and_hold" &&
    (quest.state === "available" || quest.state === "active");
  const depositAmount =
    quest.kind === "deposit_and_hold"
      ? quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd
      : 0;

  const progressPercent = progress != null ? Math.round(progress * 100) : null;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={clsx(
        "group relative overflow-hidden rounded-2xl border border-white/10",
        "bg-white/5 p-5 text-white shadow-[0_4px_30px_rgba(2,12,27,0.45)] backdrop-blur-md",
        "hover:border-white/20 hover:bg-white/8 hover:shadow-[0_8px_32px_rgba(6,20,45,0.55)] transition-all"
      )}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl border border-white/5 opacity-40" />
      <div className="pointer-events-none absolute inset-x-12 -top-20 h-40 bg-gradient-to-b from-white/15 to-transparent blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 text-2xl">
            <span className="opacity-90" aria-hidden="true">
              {icon}
            </span>
            <span className="sr-only">{vaultLabel}</span>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-tight text-white group-hover:text-white">
                {quest.title}
              </h3>
              <span
                className={clsx(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-white/60 group-hover:text-white/70">
              {quest.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              "bg-gradient-to-r",
              xpGradient(quest.rewardXp)
            )}
          >
            <span className="text-[11px] text-white/70">XP</span>
            <span className="text-sm tabular-nums text-white">
              {quest.rewardXp.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 md:justify-end">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Vault: {vaultLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {requirementCopy}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {durationCopy}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {showStart ? (
              <button
                type="button"
                onClick={() => onStart(quest.id)}
                className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-cyan-100"
              >
                Start Quest
              </button>
            ) : null}

            {canDeposit ? (
              <button
                type="button"
                onClick={() => {
                  if (quest.state === "available") {
                    onStart(quest.id);
                  }
                  onDeposit(quest, depositAmount);
                }}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                {quest.state === "available" ? "Start & Deposit" : "Deposit"}
              </button>
            ) : null}

            {quest.state === "claimable" ? (
              <button
                type="button"
                onClick={() => onClaim(quest.id)}
                className="rounded-full border border-emerald-400/40 bg-emerald-400/15 px-4 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/25 hover:text-emerald-100"
              >
                Claim XP
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {progress != null ? (
        <div className="mt-5 space-y-1">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/45">
            <span>Progress</span>
            <span className="tabular-nums text-white/60">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
            <div
              className={clsx(
                "h-full rounded-full bg-gradient-to-r",
                xpGradient(quest.rewardXp)
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {quest.runtime?.currentBalanceUsd != null ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wide text-white/55">
          <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
            Balance: {formatUsd(quest.runtime.currentBalanceUsd)}
          </span>
          {quest.claimableAt ? (
            <span className="rounded-full border border-emerald-400/30 px-3 py-1 text-emerald-200">
              Claimable since {new Date(quest.claimableAt).toLocaleString()}
            </span>
          ) : null}
          {quest.completedAt ? (
            <span className="rounded-full border border-purple-400/30 px-3 py-1 text-purple-200">
              Completed {new Date(quest.completedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
