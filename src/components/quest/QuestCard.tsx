import { Card } from "@/components/ui/card";
import {
  CardHeaderBar,
  HeaderPill,
} from "@/components/ui/card-header-bar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestRuntime, QuestState } from "@/lib/quest-state";
import { cn } from "@/lib/utils";

type QuestCardProps = {
  quest: QuestRuntime;
  onStart: (id: QuestRuntime["id"]) => void;
  onClaim: (id: QuestRuntime["id"]) => void;
  onFail?: (id: QuestRuntime["id"]) => void;
  className?: string;
};

const stateToPill: Record<
  QuestState,
  { label: string; tone?: "neutral" | "success" | "warn" }
> = {
  locked: { label: "Locked", tone: "warn" },
  available: { label: "Available" },
  active: { label: "In progress" },
  claimable: { label: "Claimable", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "warn" },
};

const formatUsd = (value: number | undefined) => {
  if (value === undefined) return undefined;
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
};

const getSubtitle = (quest: QuestRuntime) => {
  if (quest.state === "locked" && quest.minDepositUsd) {
    return `Unlock by depositing at least ${formatUsd(quest.minDepositUsd)}`;
  }
  if (quest.state === "failed" && quest.cooldownUntil) {
    return `Try again after ${new Date(
      quest.cooldownUntil
    ).toLocaleString()}`;
  }
  if (quest.state === "active" && quest.claimableAt) {
    return `Eligible to claim on ${new Date(
      quest.claimableAt
    ).toLocaleDateString()}`;
  }
  return quest.description;
};

export function QuestCard({
  quest,
  onStart,
  onClaim,
  onFail,
  className,
}: QuestCardProps) {
  const pill = stateToPill[quest.state];
  const headerRight = (
    <HeaderPill tone={pill.tone}>{pill.label}</HeaderPill>
  );
  const subtitle = getSubtitle(quest);

  const showProgress =
    quest.state === "active" ||
    quest.state === "claimable" ||
    quest.progressPct;

  const progressValue =
    quest.progressPct !== undefined ? quest.progressPct : 0;

  return (
    <Card
      className={cn(
        "glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white",
        className
      )}
    >
      <CardHeaderBar
        title={quest.title}
        right={headerRight}
        subtitle={subtitle}
      />
      <div className="p-6 space-y-4">
        <div className="text-sm text-white/70">
          Reward:{" "}
          <span className="text-white/90 font-medium">
            {quest.rewardXp.toLocaleString()} XP Shares
          </span>
        </div>

        {quest.minDepositUsd && (
          <div className="text-xs text-white/55">
            Minimum deposit:{" "}
            <span className="text-white/80">
              {formatUsd(quest.minDepositUsd)}
            </span>
          </div>
        )}

        {quest.streakDays && (
          <div className="text-xs text-white/55">
            Maintain deposits for{" "}
            <span className="text-white/80">
              {quest.streakDays} consecutive day
              {quest.streakDays > 1 ? "s" : ""}
            </span>
            .
          </div>
        )}

        {quest.holdDays && (
          <div className="text-xs text-white/55">
            Hold balance for{" "}
            <span className="text-white/80">
              {quest.holdDays} day{quest.holdDays > 1 ? "s" : ""}
            </span>
            .
          </div>
        )}

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Progress</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress
              value={progressValue}
              className="h-2 bg-white/10"
              indicatorClassName="bg-emerald-400"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          {quest.state === "available" && (
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white/85 hover:bg-white/10"
              onClick={() => onStart(quest.id)}
            >
              Start Quest
            </Button>
          )}
          {quest.state === "claimable" && (
            <Button
              className="border border-white/20 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
              onClick={() => onClaim(quest.id)}
            >
              Claim Reward
            </Button>
          )}
          {quest.state === "failed" && onFail && (
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white"
              onClick={() => onFail(quest.id)}
            >
              Dismiss
            </Button>
          )}
          {quest.state === "locked" && !quest.minDepositUsd && (
            <span className="text-xs text-white/50">
              Keep exploring to unlock.
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
