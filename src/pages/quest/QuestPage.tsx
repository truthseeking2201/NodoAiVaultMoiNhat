import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuestSummaryCard from "@/components/quest/cards/QuestSummaryCard";
import { QuestSectionList } from "@/components/quest/QuestSectionList";
import { QuestDepositModal } from "@/components/quest/deposit/QuestDepositModal";
import { useQuestV2 } from "@/hooks/useQuestV2";
import type { Quest } from "@/lib/quest-types";

const getSuggestedDepositAmount = (quest: Quest) => {
  if (quest.kind !== "deposit_and_hold") {
    return 0;
  }
  const required = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
  const current = quest.runtime?.currentBalanceUsd ?? 0;
  const missing = Math.max(0, required - current);
  return missing > 0 ? missing : required;
};

type QuestSection = {
  id: string;
  title: string;
  subtitle: string;
  items: Quest[];
  emptyCopy: string;
  hideWhenEmpty?: boolean;
};

export default function QuestPage() {
  const { quests, start, claim } = useQuestV2();
  const [modal, setModal] = useState<{
    open: boolean;
    quest?: Quest;
    amountUsd?: number;
  }>(() => ({
    open: false,
  }));

  const activeCount = useMemo(
    () => quests.filter((quest) => quest.state === "active").length,
    [quests]
  );
  const claimableCount = useMemo(
    () => quests.filter((quest) => quest.state === "claimable").length,
    [quests]
  );
  const totalXp = useMemo(
    () =>
      quests
        .filter((quest) => quest.state === "completed")
        .reduce((sum, quest) => sum + quest.rewardXp, 0),
    [quests]
  );

  const questSections = useMemo<QuestSection[]>(() => {
    const claimable = quests.filter((quest) => quest.state === "claimable");
    const active = quests.filter((quest) => quest.state === "active");
    const available = quests.filter((quest) => quest.state === "available");
    const locked = quests.filter((quest) => quest.state === "locked");
    const completed = quests.filter((quest) => quest.state === "completed");
    const failed = quests.filter((quest) => quest.state === "failed");

    return [
      {
        id: "claimable",
        title: "Claim Rewards",
        subtitle: "Collect XP from finished quests.",
        items: claimable,
        emptyCopy: "No claimable quests right now—wrap up a quest to see it here.",
      },
      {
        id: "active",
        title: "In Progress",
        subtitle: "Track quests you’ve already started.",
        items: active,
        emptyCopy: "Activate a quest to follow your progress here.",
      },
      {
        id: "available",
        title: "Available Now",
        subtitle: "New quests to boost your vault XP.",
        items: available,
        emptyCopy: "All quests completed—for now. Check back soon for more.",
      },
      {
        id: "locked",
        title: "Upcoming & Locked",
        subtitle: "Unlock these by meeting the requirements.",
        items: locked,
        emptyCopy: "No locked quests—keep progressing to reveal new tiers.",
        hideWhenEmpty: true,
      },
      {
        id: "completed",
        title: "Completed",
        subtitle: "XP already counted toward your profile.",
        items: completed,
        emptyCopy: "You haven’t completed any quests yet. Keep going!",
        hideWhenEmpty: true,
      },
      {
        id: "failed",
        title: "Needs Another Attempt",
        subtitle: "Restart these quests when you’re ready.",
        items: failed,
        emptyCopy: "No failed quests—nice work staying on track.",
        hideWhenEmpty: true,
      },
    ];
  }, [quests]);

  const showDepositModal = (quest: Quest, amountUsd?: number) => {
    const resolvedAmount =
      amountUsd && amountUsd > 0
        ? amountUsd
        : quest.kind === "deposit_and_hold"
          ? getSuggestedDepositAmount(quest)
          : 0;
    setModal({ open: true, quest, amountUsd: resolvedAmount });
  };

  const handleDepositConfirmed = (amountUsd: number) => {
    const quest = modal.quest;
    if (!quest) {
      setModal({ open: false });
      return;
    }
    if (quest.vaultIdRequired) {
      window.dispatchEvent(
        new CustomEvent("deposit:confirmed", {
          detail: {
            vaultId: quest.vaultIdRequired,
            amountUsd,
          },
        })
      );
    }
    setModal({ open: false });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 text-white sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(80,227,194,0.2),rgba(10,14,24,0.55))] p-8 shadow-[0_16px_70px_rgba(6,20,45,0.65)] backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-80" />
        <div className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-emerald-400/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-36 w-60 -translate-x-1/2 rounded-full border border-white/10 opacity-40" />
        <div className="pointer-events-none absolute right-10 top-8 hidden h-24 w-24 rotate-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl text-emerald-200/80 sm:flex">
          ✦
        </div>

        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200 backdrop-blur">
            Quest Hub
          </span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Level up your vault XP with curated quests
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Start quests to grow XP Shares, unlock bonuses, and earn rewards as you master vault strategies.
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <QuestSummaryCard
          totalXp={totalXp}
          activeCount={activeCount}
          claimableCount={claimableCount}
        />
      </motion.section>

      <section className="space-y-8">
        <AnimatePresence initial={false}>
          {questSections
            .filter((section) => section.items.length || !section.hideWhenEmpty)
            .map((section, index) => (
              <motion.section
                key={section.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: 0.05 * index, duration: 0.45 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_14px_55px_rgba(6,20,45,0.45)] backdrop-blur-md sm:p-7"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full border border-white/10 opacity-0 blur-2xl transition-all group-hover:opacity-60" />

                <div className="relative space-y-5">
                  <SectionHeader
                    title={section.title}
                    subtitle={section.subtitle}
                  />
                  {section.items.length ? (
                    <QuestSectionList
                      quests={section.items}
                      onStart={start}
                      onClaim={claim}
                      onDeposit={(questItem, amountUsd) =>
                        showDepositModal(questItem, amountUsd)
                      }
                    />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-sm text-white/55">
                      {section.emptyCopy}
                    </div>
                  )}
                </div>
              </motion.section>
            ))}
        </AnimatePresence>
      </section>

      {modal.open && modal.quest && modal.quest.kind === "deposit_and_hold" && (
        <QuestDepositModal
          open={modal.open}
          onOpenChange={(open) => setModal((prev) => ({ ...prev, open }))}
          defaultAmountUsd={
            modal.amountUsd ??
            modal.quest.runtime?.requiredDepositUsd ??
            modal.quest.minDepositUsd
          }
          onDepositConfirmed={handleDepositConfirmed}
        />
      )}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
        {subtitle ? (
          <p className="text-xs uppercase tracking-[0.18em] text-white/45 sm:text-[13px] sm:normal-case sm:tracking-normal">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
