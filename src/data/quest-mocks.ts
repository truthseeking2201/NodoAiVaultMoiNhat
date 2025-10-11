import {
  Quest,
  DepositAndHoldQuest,
  HoldExistingQuest,
  QuestState,
  VaultTx,
  QuestRuntimeMeta,
} from "@/lib/quest-types";

const nowIso = () => new Date().toISOString();

let QUESTS: Quest[] = [
  {
    id: "q_deposit_200_usdc_sui_72h",
    kind: "deposit_and_hold",
    title: "Deposit $200 into USDC/SUI and hold for 72h",
    description:
      "Deposit at least $200 into the USDC/SUI vault and keep your balance ≥ $200 for 72 hours.",
    rewardXp: 6000,
    vaultIdRequired: "vault_usdc_sui",
    minDepositUsd: 200,
    holdHours: 72,
    resetOnDrop: true,
    state: "available",
  },
  {
    id: "q_hold_existing_7d_any",
    kind: "hold_existing",
    title: "Hold ≥ $50 for 7 days",
    description:
      "Maintain an account balance of at least $50 for 7 consecutive days across any vault.",
    rewardXp: 3500,
    vaultIdRequired: "any",
    holdThresholdUsd: 50,
    holdHours: 168,
    resetOnDrop: true,
    state: "active",
    startedAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
  },
];

let TXS: VaultTx[] = [];

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
