import {
  Quest,
  DepositAndHoldQuest,
  HoldExistingQuest,
  QuestState,
  VaultTx,
  QuestRuntimeMeta,
} from "@/lib/quest-types";

const nowIso = () => new Date().toISOString();
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3600_000).toISOString();

let QUESTS: Quest[] = [
  {
    id: "q_deposit_200_usdc_sui_72h",
    kind: "deposit_and_hold",
    title: "Starter Boost: $200 into USDC/SUI for 72h",
    description:
      "Prime the USDC/SUI vault with at least $200 and hold for three days to warm up your streak.",
    rewardXp: 2_800,
    vaultIdRequired: "vault_usdc_sui",
    minDepositUsd: 200,
    holdHours: 72,
    resetOnDrop: true,
    state: "available",
  },
  {
    id: "q_hold_existing_7d_any",
    kind: "hold_existing",
    title: "Foundation Hold: Keep ≥ $50 for 7 days",
    description:
      "Maintain a minimum of $50 across any vault for a full week to lock in baseline XP.",
    rewardXp: 3_200,
    vaultIdRequired: "any",
    holdThresholdUsd: 50,
    holdHours: 168,
    resetOnDrop: true,
    state: "active",
    startedAt: hoursAgo(48),
  },
  {
    id: "q_deposit_500_usdc_sui_48h",
    kind: "deposit_and_hold",
    title: "Momentum: Hold $500 in USDC/SUI for 48h",
    description:
      "Scale into the USDC/SUI vault with a $500 position and hold steady for two days.",
    rewardXp: 4_500,
    vaultIdRequired: "vault_usdc_sui",
    minDepositUsd: 500,
    holdHours: 48,
    resetOnDrop: true,
    state: "active",
    startedAt: hoursAgo(12),
  },
  {
    id: "q_hold_sui_5d",
    kind: "hold_existing",
    title: "SUI Sentinel: Maintain $150 for 5 days",
    description:
      "Defend the SUI vault with a $150 position and hold the line for five consecutive days.",
    rewardXp: 4_800,
    vaultIdRequired: "vault_sui",
    holdThresholdUsd: 150,
    holdHours: 120,
    resetOnDrop: true,
    state: "active",
    startedAt: hoursAgo(36),
  },
  {
    id: "q_deposit_1000_sui_96h",
    kind: "deposit_and_hold",
    title: "Catalyst: $1,000 SUI vault sustain",
    description:
      "Deploy $1,000 into the SUI vault and sustain the position for four days to unlock catalyst XP.",
    rewardXp: 8_600,
    vaultIdRequired: "vault_sui",
    minDepositUsd: 1_000,
    holdHours: 96,
    resetOnDrop: true,
    state: "claimable",
    startedAt: hoursAgo(110),
    claimableAt: hoursAgo(8),
  },
  {
    id: "q_hold_any_14d",
    kind: "hold_existing",
    title: "Operator Commitment: Cross-vault $250 for 14 days",
    description:
      "Demonstrate commitment by keeping at least $250 across any vaults for two full weeks.",
    rewardXp: 9_200,
    vaultIdRequired: "any",
    holdThresholdUsd: 250,
    holdHours: 336,
    resetOnDrop: false,
    state: "claimable",
    startedAt: hoursAgo(350),
    claimableAt: hoursAgo(2),
  },
  {
    id: "q_deposit_150_usdt_24h",
    kind: "deposit_and_hold",
    title: "Flash Start: $150 into USDT/SUI for 24h",
    description:
      "Kick off in the USDT/SUI vault with a light $150 position and hold for 24 hours.",
    rewardXp: 1_600,
    vaultIdRequired: "vault_usdt_sui",
    minDepositUsd: 150,
    holdHours: 24,
    resetOnDrop: true,
    state: "available",
  },
  {
    id: "q_hold_usdc_growth_10d",
    kind: "hold_existing",
    title: "Growth Track: Hold $300 in USDC vault for 10 days",
    description:
      "Stay allocated with $300 in the USDC-focused vault for ten days to build steady XP.",
    rewardXp: 6_400,
    vaultIdRequired: "vault_usdc_sui",
    holdThresholdUsd: 300,
    holdHours: 240,
    resetOnDrop: true,
    state: "available",
  },
  {
    id: "q_deposit_2500_sui_7d",
    kind: "deposit_and_hold",
    title: "Prime Node: Hold $2,500 SUI for 7 days",
    description:
      "Anchor a $2,500 position in the SUI vault and maintain it for seven days to prove mastery.",
    rewardXp: 12_500,
    vaultIdRequired: "vault_sui",
    minDepositUsd: 2_500,
    holdHours: 168,
    resetOnDrop: false,
    state: "completed",
    startedAt: hoursAgo(220),
    completedAt: hoursAgo(20),
  },
  {
    id: "q_hold_any_ledger_21d",
    kind: "hold_existing",
    title: "Ledger Guardian: $500 cross-vault for 21 days",
    description:
      "Guard the ecosystem with $500 distributed across vaults for three weeks straight.",
    rewardXp: 15_400,
    vaultIdRequired: "any",
    holdThresholdUsd: 500,
    holdHours: 504,
    resetOnDrop: false,
    state: "completed",
    startedAt: hoursAgo(600),
    completedAt: hoursAgo(5),
  },
  {
    id: "q_deposit_locked_tier3",
    kind: "deposit_and_hold",
    title: "Tier III Access: Deposit $3,000 in USDC/SUI",
    description:
      "Unlock Tier III by depositing $3,000 into the USDC/SUI vault and holding for five days.",
    rewardXp: 14_000,
    vaultIdRequired: "vault_usdc_sui",
    minDepositUsd: 3_000,
    holdHours: 120,
    resetOnDrop: true,
    state: "locked",
    lockedReason: "tier_not_unlocked",
  },
  {
    id: "q_hold_locked_kyc",
    kind: "hold_existing",
    title: "Compliance Gate: Hold $200 post-KYC",
    description:
      "Complete verification to hold $200 across vaults for five days and unlock compliance XP.",
    rewardXp: 5_200,
    vaultIdRequired: "any",
    holdThresholdUsd: 200,
    holdHours: 120,
    resetOnDrop: true,
    state: "locked",
    lockedReason: "kyc_required",
  },
  {
    id: "q_deposit_failed_reset",
    kind: "deposit_and_hold",
    title: "Reset Challenge: $400 USDT/SUI for 48h",
    description:
      "Reattempt the $400 USDT/SUI challenge. Keep the balance above target for 48 hours.",
    rewardXp: 4_200,
    vaultIdRequired: "vault_usdt_sui",
    minDepositUsd: 400,
    holdHours: 48,
    resetOnDrop: true,
    state: "failed",
    startedAt: hoursAgo(60),
    endAt: hoursAgo(12),
  },
  {
    id: "q_hold_failed_threshold",
    kind: "hold_existing",
    title: "Stability Loss: $350 cross-vault hold",
    description:
      "Balance dipped below requirement—restore $350 across vaults for a 9 day recovery quest.",
    rewardXp: 7_100,
    vaultIdRequired: "any",
    holdThresholdUsd: 350,
    holdHours: 216,
    resetOnDrop: false,
    state: "failed",
    startedAt: hoursAgo(220),
    endAt: hoursAgo(10),
  },
  {
    id: "q_deposit_elite_sui",
    kind: "deposit_and_hold",
    title: "Elite Flow: $5,000 SUI for 10 days",
    description:
      "Step into elite flow with a $5,000 SUI position held for ten days. Maintain to unlock whale-tier XP.",
    rewardXp: 22_500,
    vaultIdRequired: "vault_sui",
    minDepositUsd: 5_000,
    holdHours: 240,
    resetOnDrop: false,
    state: "available",
  },
  {
    id: "q_hold_any_marathon",
    kind: "hold_existing",
    title: "Marathon Run: $750 across vaults for 30 days",
    description:
      "Stay marathon-strong by sustaining $750 across vaults for a month and stack loyalty XP.",
    rewardXp: 19_000,
    vaultIdRequired: "any",
    holdThresholdUsd: 750,
    holdHours: 720,
    resetOnDrop: false,
    state: "active",
    startedAt: hoursAgo(300),
  },
  {
    id: "q_deposit_combo_dual",
    kind: "deposit_and_hold",
    title: "Synergy Combo: $600 split across dual vaults",
    description:
      "Deploy $600 between two dual-asset vaults and hold for 72 hours without dropping thresholds.",
    rewardXp: 6_800,
    vaultIdRequired: "vault_usdt_sui",
    minDepositUsd: 600,
    holdHours: 72,
    resetOnDrop: true,
    state: "active",
    startedAt: hoursAgo(20),
  },
  {
    id: "q_hold_any_speedrun",
    kind: "hold_existing",
    title: "Speedrun: $120 for 48h",
    description:
      "Execute a precise $120 hold across any vaults for just 48 hours—perfect for streak chaining.",
    rewardXp: 2_200,
    vaultIdRequired: "any",
    holdThresholdUsd: 120,
    holdHours: 48,
    resetOnDrop: true,
    state: "claimable",
    startedAt: hoursAgo(52),
    claimableAt: hoursAgo(1),
  },
  {
    id: "q_deposit_glory_path",
    kind: "deposit_and_hold",
    title: "Glory Path: $800 into USDC/SUI for 96h",
    description:
      "Fuel the USDC/SUI strategy with $800 and keep it staked for four days to extend your combo.",
    rewardXp: 7_600,
    vaultIdRequired: "vault_usdc_sui",
    minDepositUsd: 800,
    holdHours: 96,
    resetOnDrop: true,
    state: "available",
  },
  {
    id: "q_hold_any_veteran",
    kind: "hold_existing",
    title: "Veteran Status: $1,000 over 45 days",
    description:
      "Hold $1,000 across the vault suite for 45 days to cement veteran status and unlock prestige XP.",
    rewardXp: 28_000,
    vaultIdRequired: "any",
    holdThresholdUsd: 1_000,
    holdHours: 1_080,
    resetOnDrop: false,
    state: "completed",
    startedAt: hoursAgo(1200),
    completedAt: hoursAgo(15),
  },
  {
    id: "q_deposit_precision_quest",
    kind: "deposit_and_hold",
    title: "Precision Quest: $350 USDT/SUI for 36h",
    description:
      "Execute a tight $350 allocation into the USDT/SUI vault for 36 hours without dips.",
    rewardXp: 3_600,
    vaultIdRequired: "vault_usdt_sui",
    minDepositUsd: 350,
    holdHours: 36,
    resetOnDrop: true,
    state: "available",
  },
];

const TXS: VaultTx[] = [];

type RuntimeCache = {
  heldSince: string | null;
};

const RUNTIME: Record<string, RuntimeCache> = {};

const ensureRuntime = (quest: Quest) => {
  if (!RUNTIME[quest.id]) {
    RUNTIME[quest.id] = { heldSince: quest.startedAt ?? null };
  }
  return RUNTIME[quest.id];
};

const getVaultBalanceUsd = (vaultId: string) => {
  const sum = TXS.filter((tx) => tx.vaultId === vaultId).reduce(
    (acc, tx) => acc + (tx.type === "deposit" ? tx.amountUsd : -tx.amountUsd),
    0
  );
  return Math.max(0, sum);
};

const getAnyBalanceUsd = () => {
  const perVault: Record<string, number> = {};
  TXS.forEach((tx) => {
    perVault[tx.vaultId] =
      (perVault[tx.vaultId] ?? 0) +
      (tx.type === "deposit" ? tx.amountUsd : -tx.amountUsd);
  });
  return Object.values(perVault)
    .map((value) => Math.max(0, value))
    .reduce((acc, value) => acc + value, 0);
};

const cloneQuest = (quest: Quest): Quest => ({
  ...quest,
  runtime: quest.runtime ? { ...quest.runtime } : undefined,
});

const toRuntimeMeta = (input: Partial<QuestRuntimeMeta>): QuestRuntimeMeta => ({
  currentBalanceUsd: input.currentBalanceUsd ?? 0,
  requiredDepositUsd: input.requiredDepositUsd,
  thresholdUsd: input.thresholdUsd,
  depositMet: input.depositMet ?? false,
  holdRequiredMs: input.holdRequiredMs ?? 0,
  holdAccumulatedMs: input.holdAccumulatedMs ?? 0,
  holdRemainingMs: input.holdRemainingMs ?? 0,
});

const recomputeDepositQuest = (quest: DepositAndHoldQuest): Quest => {
  const runtime = ensureRuntime(quest);
  const now = Date.now();
  const result = cloneQuest(quest) as DepositAndHoldQuest;
  const currentBalance = getVaultBalanceUsd(quest.vaultIdRequired ?? "");
  const depositMet = currentBalance >= quest.minDepositUsd;
  const requiredMs = quest.holdHours * 3600_000;

  if (result.state === "completed") {
    result.runtime = toRuntimeMeta({
      currentBalanceUsd: currentBalance,
      requiredDepositUsd: quest.minDepositUsd,
      depositMet: true,
      holdRequiredMs: requiredMs,
      holdAccumulatedMs: requiredMs,
      holdRemainingMs: 0,
    });
    return result;
  }

  if (result.state === "claimable") {
    result.runtime = toRuntimeMeta({
      currentBalanceUsd: currentBalance,
      requiredDepositUsd: quest.minDepositUsd,
      depositMet: depositMet,
      holdRequiredMs: requiredMs,
      holdAccumulatedMs: requiredMs,
      holdRemainingMs: 0,
    });
    return result;
  }

  if (depositMet && runtime.heldSince === null) {
    runtime.heldSince = nowIso();
    result.startedAt = runtime.heldSince;
    result.endAt = new Date(now + requiredMs).toISOString();
  }

  if (!depositMet && runtime.heldSince) {
    if (result.resetOnDrop !== false) {
      runtime.heldSince = null;
      result.startedAt = undefined;
      result.endAt = undefined;
    } else {
      result.state = "failed";
    }
  }

  const heldMs = runtime.heldSince ? now - Date.parse(runtime.heldSince) : 0;
  const remainingMs = Math.max(0, requiredMs - heldMs);

  if (depositMet && heldMs >= requiredMs) {
    result.state = "claimable";
    result.claimableAt = nowIso();
  } else if (result.state === "available" && depositMet) {
    result.state = "active";
  } else if (result.state !== "failed") {
    result.state = depositMet ? "active" : result.state;
  }

  result.runtime = toRuntimeMeta({
    currentBalanceUsd: currentBalance,
    requiredDepositUsd: quest.minDepositUsd,
    depositMet,
    holdRequiredMs: requiredMs,
    holdAccumulatedMs: depositMet ? heldMs : 0,
    holdRemainingMs: depositMet ? remainingMs : requiredMs,
  });

  return result;
};

const recomputeHoldQuest = (quest: HoldExistingQuest): Quest => {
  const runtime = ensureRuntime(quest);
  const now = Date.now();
  const result = cloneQuest(quest) as HoldExistingQuest;
  const balance =
    quest.vaultIdRequired === "any"
      ? getAnyBalanceUsd()
      : getVaultBalanceUsd(quest.vaultIdRequired ?? "");
  const thresholdMet = balance >= quest.holdThresholdUsd;
  const requiredMs = quest.holdHours * 3600_000;

  if (result.state === "completed") {
    result.runtime = toRuntimeMeta({
      currentBalanceUsd: balance,
      thresholdUsd: quest.holdThresholdUsd,
      depositMet: true,
      holdRequiredMs: requiredMs,
      holdAccumulatedMs: requiredMs,
      holdRemainingMs: 0,
    });
    return result;
  }

  if (result.state === "claimable") {
    result.runtime = toRuntimeMeta({
      currentBalanceUsd: balance,
      thresholdUsd: quest.holdThresholdUsd,
      depositMet: true,
      holdRequiredMs: requiredMs,
      holdAccumulatedMs: requiredMs,
      holdRemainingMs: 0,
    });
    return result;
  }

  if (thresholdMet && runtime.heldSince === null) {
    runtime.heldSince = nowIso();
    result.startedAt = runtime.heldSince;
    result.endAt = new Date(now + requiredMs).toISOString();
  }

  if (!thresholdMet && runtime.heldSince) {
    if (result.resetOnDrop !== false) {
      runtime.heldSince = null;
      result.startedAt = undefined;
      result.endAt = undefined;
      if (result.state !== "available") {
        result.state = "active";
      }
    } else {
      result.state = "failed";
    }
  }

  const heldMs = runtime.heldSince ? now - Date.parse(runtime.heldSince) : 0;
  const remainingMs = Math.max(0, requiredMs - heldMs);

  if (thresholdMet && heldMs >= requiredMs) {
    result.state = "claimable";
    result.claimableAt = nowIso();
  } else if (result.state === "available" && thresholdMet) {
    result.state = "active";
  }

  result.runtime = toRuntimeMeta({
    currentBalanceUsd: balance,
    thresholdUsd: quest.holdThresholdUsd,
    depositMet: thresholdMet,
    holdRequiredMs: requiredMs,
    holdAccumulatedMs: thresholdMet ? heldMs : 0,
    holdRemainingMs: thresholdMet ? remainingMs : requiredMs,
  });

  return result;
};

const recomputeQuest = (quest: Quest): Quest => {
  if (quest.state === "failed" || quest.state === "completed") {
    // still compute runtime for display but avoid state changes
    if (quest.kind === "deposit_and_hold") {
      return recomputeDepositQuest(quest as DepositAndHoldQuest);
    }
    return recomputeHoldQuest(quest as HoldExistingQuest);
  }

  if (quest.kind === "deposit_and_hold") {
    return recomputeDepositQuest(quest as DepositAndHoldQuest);
  }
  return recomputeHoldQuest(quest as HoldExistingQuest);
};

const updateQuestState = (id: string, updater: (quest: Quest) => Quest) => {
  QUESTS = QUESTS.map((quest) =>
    quest.id === id ? updater(cloneQuest(quest)) : quest
  );
};

export function questMockServiceV2() {
  return {
    list(): Quest[] {
      QUESTS = QUESTS.map((quest) => recomputeQuest(quest));
      return QUESTS.map((quest) => cloneQuest(quest));
    },
    start(id: string) {
      updateQuestState(id, (quest) => {
        if (quest.state === "available") {
          quest.state = "active";
        }
        return quest;
      });
      QUESTS = QUESTS.map((quest) => recomputeQuest(quest));
    },
    claim(id: string) {
      updateQuestState(id, (quest) => {
        if (quest.state === "claimable") {
          quest.state = "completed";
          quest.completedAt = nowIso();
        }
        return quest;
      });
      QUESTS = QUESTS.map((quest) => recomputeQuest(quest));
    },
    onDepositConfirmed(vaultId: string, amountUsd: number) {
      TXS.push({
        type: "deposit",
        vaultId,
        amountUsd,
        ts: nowIso(),
      });
      QUESTS = QUESTS.map((quest) => recomputeQuest(quest));
    },
    onWithdrawConfirmed(vaultId: string, amountUsd: number) {
      TXS.push({
        type: "withdraw",
        vaultId,
        amountUsd,
        ts: nowIso(),
      });
      QUESTS = QUESTS.map((quest) => recomputeQuest(quest));
    },
  };
}
