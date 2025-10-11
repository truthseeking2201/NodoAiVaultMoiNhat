import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Gift, PartyPopper, Share2, Users, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardHeaderBar } from "@/components/ui/card-header-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type MissionStatus = "available" | "eligible" | "claimed" | "locked";

export type Mission = {
  id: string;
  icon: "wallet" | "gift" | "users";
  title: string;
  thresholdUsd: number;
  xpShares: number;
  status: MissionStatus;
  completedAt?: string;
  claimedAt?: string;
  description?: string;
};

const ICONS: Record<Mission["icon"], JSX.Element> = {
  wallet: <Wallet size={16} className="text-white/70" />,
  gift: <Gift size={16} className="text-white/70" />,
  users: <Users size={16} className="text-white/70" />,
};

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: "welcome_5",
    icon: "wallet",
    title: "Deposit $5 to earn 500 XP Shares",
    thresholdUsd: 5,
    xpShares: 500,
    status: "available",
  },
  {
    id: "level_50",
    icon: "gift",
    title: "Deposit $50 to earn 2,000 XP Shares",
    thresholdUsd: 50,
    xpShares: 2000,
    status: "available",
  },
  {
    id: "streak_3d",
    icon: "users",
    title: "Complete a 3-day deposit streak for 3,000 XP Shares",
    thresholdUsd: 0,
    xpShares: 3000,
    status: "locked",
  },
];

type MissionsXPCardProps = {
  missions?: Mission[];
  onDepositPrefill: (usdAmount: number) => void;
  onClaimMission?: (mission: Mission) => Promise<void> | void;
  onShareMission?: (mission: Mission) => void;
  isDepositDisabled?: boolean;
  disabledReason?: string;
  className?: string;
};

export function MissionsXPCard({
  missions,
  onDepositPrefill,
  onClaimMission,
  onShareMission,
  isDepositDisabled,
  disabledReason,
  className,
}: MissionsXPCardProps) {
  const { toast } = useToast();
  const [currentMissions, setCurrentMissions] = useState<Mission[]>(
    missions ?? DEFAULT_MISSIONS
  );
  const [celebrationMission, setCelebrationMission] = useState<Mission | null>(
    null
  );
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(
    null
  );
  const [showHistory, setShowHistory] = useState(false);
  const [highlightMissionId, setHighlightMissionId] = useState<string | null>(
    null
  );
  const missionRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const previousStatuses = useRef<Record<string, MissionStatus>>({});

  useEffect(() => {
    setCurrentMissions(missions ?? DEFAULT_MISSIONS);
  }, [missions]);

  useEffect(() => {
    currentMissions.forEach((mission) => {
      const previousStatus = previousStatuses.current[mission.id];

      if (previousStatus !== mission.status) {
        if (mission.status === "eligible") {
          setCelebrationMission(mission);
        }

        if (mission.status === "claimed") {
          toast({
            variant: "success",
            title: "Reward claimed",
            description: `You earned ${mission.xpShares.toLocaleString(
              "en-US"
            )} XP Shares.`,
            duration: 5000,
          });
        }
      }

      previousStatuses.current[mission.id] = mission.status;
    });
  }, [currentMissions, toast]);

  const allMissionsClaimed = useMemo(
    () => currentMissions.every((mission) => mission.status === "claimed"),
    [currentMissions]
  );

  const totalXp = useMemo(
    () =>
      currentMissions.reduce((sum, mission) => sum + mission.xpShares, 0),
    [currentMissions]
  );

  const nextActionMission = useMemo(
    () =>
      currentMissions.find((mission) => mission.status === "available"),
    [currentMissions]
  );

  useEffect(() => {
    if (nextActionMission?.id) {
      setHighlightMissionId(nextActionMission.id);
    } else {
      setHighlightMissionId(null);
    }
  }, [nextActionMission?.id]);

  useEffect(() => {
    if (!highlightMissionId) return;
    const node = missionRefs.current[highlightMissionId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightMissionId]);

  const updateMissionStatus = (missionId: string, status: MissionStatus) => {
    setCurrentMissions((prev) =>
      prev.map((mission) =>
        mission.id === missionId
          ? {
              ...mission,
              status,
              claimedAt:
                status === "claimed"
                  ? new Date().toISOString()
                  : mission.claimedAt,
              completedAt:
                status === "eligible"
                  ? new Date().toISOString()
                  : mission.completedAt,
            }
          : mission
      )
    );
  };

  const handleClaim = async (mission: Mission) => {
    setClaimingMissionId(mission.id);
    try {
      await Promise.resolve(onClaimMission?.(mission));
      updateMissionStatus(mission.id, "claimed");
      setCelebrationMission(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast({
        variant: "destructive",
        title: "Unable to claim reward",
        description: message,
      });
    } finally {
      setClaimingMissionId(null);
    }
  };

  const handleStartMission = (mission: Mission) => {
    onDepositPrefill(mission.thresholdUsd);
    setHighlightMissionId(mission.id);
  };

  const handleShare = (mission: Mission) => {
    onShareMission?.(mission);
    toast({
      title: "Shared with your squad",
      description: "Let them know how you cleared this mission.",
      duration: 4000,
    });
  };

  const missionList = (
    <ul className="divide-y divide-white/10">
      {currentMissions.map((mission) => {
        const isLocked = mission.status === "locked";
        const isAvailable = mission.status === "available";
        const isEligible = mission.status === "eligible";
        const isClaimed = mission.status === "claimed";
        const isHighlighted = mission.id === highlightMissionId;

        return (
          <li
            key={mission.id}
            ref={(node) => {
              missionRefs.current[mission.id] = node;
            }}
            className={cn(
              "py-3 transition duration-300",
              isHighlighted && !allMissionsClaimed &&
                "rounded-lg bg-white/5 shadow-[0_0_0_1px_rgba(255,189,36,0.35)]"
            )}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    {ICONS[mission.icon]}
                  </div>
                  <div>
                    <p className="text-sm leading-5 text-white/90 md:text-[15px]">
                      {mission.title}
                    </p>
                    {isEligible && (
                      <p className="mt-1 text-xs text-emerald-300/90">
                        Ready to claim your reward.
                      </p>
                    )}
                    {isClaimed && mission.claimedAt && (
                      <p className="mt-1 text-xs text-white/50">
                        Claimed {new Date(mission.claimedAt).toLocaleString()}
                      </p>
                    )}
                    {mission.description && (
                      <p className="mt-1 text-xs text-white/60">
                        {mission.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/15 bg-white/8 text-[12px] text-white/85"
                  >
                    XP {mission.xpShares.toLocaleString("en-US")}
                  </Badge>
                  {isClaimed ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-200">
                        <Check size={14} className="mr-1" />
                        Claimed
                      </Badge>
                      {onShareMission && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/70 hover:text-white"
                          onClick={() => handleShare(mission)}
                          aria-label="Share mission"
                        >
                          <Share2 size={16} />
                        </Button>
                      )}
                    </div>
                  ) : isDepositDisabled ? (
                    <span className="text-[13px] text-orange-400">
                      {disabledReason ?? "Temporarily paused"}
                    </span>
                  ) : isLocked ? (
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-transparent text-[12px] text-white/60"
                    >
                      Locked
                    </Badge>
                  ) : isEligible ? (
                    <Button
                      size="sm"
                      className="bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                      onClick={() => handleClaim(mission)}
                      disabled={claimingMissionId === mission.id}
                    >
                      {claimingMissionId === mission.id
                        ? "Claiming..."
                        : "Claim reward"}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white"
                      onClick={() => handleStartMission(mission)}
                    >
                      {mission.thresholdUsd
                        ? `Deposit $${mission.thresholdUsd}`
                        : "Start"}
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {isLocked && (
              <p className="mt-1 pl-10 text-xs text-white/45">
                Complete earlier missions first.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );

  const headingId = "missions-xp-card-heading";
  const headerTitle = allMissionsClaimed
    ? "All missions cleared"
    : "Complete missions to get more rewards";
  const headerRight = (
    <div className="flex items-center gap-2">
      <Badge className="bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-white/75">
        Total XP {totalXp.toLocaleString("en-US")}
      </Badge>
      {allMissionsClaimed && (
        <Button
          size="xs"
          variant="outline"
          className="h-8 border-white/15 text-[12px] text-white/75 hover:text-white"
          onClick={() => setShowHistory((prev) => !prev)}
        >
          {showHistory ? "Hide mission log" : "View mission log"}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Card
        className={cn(
          "glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm shadow-[0_2px_20px_rgba(0,0,0,0.25)]",
          className
        )}
        aria-labelledby={headingId}
      >
        <CardHeaderBar
          title={headerTitle}
          subtitle="Prefilled deposits keep you on track without extra clicks."
          right={headerRight}
          titleId={headingId}
        />
        <div className="p-6">
          <p className="text-sm text-white/60">
            {allMissionsClaimed
              ? `You unlocked ${totalXp.toLocaleString(
                  "en-US"
                )} XP Shares. New missions will refresh soon.`
              : "Every mission boosts your vault streak and XP rewards."}
          </p>

          <div className="mt-4">
            {allMissionsClaimed && !showHistory ? (
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-white/75">
                  <PartyPopper size={18} className="text-amber-200" />
                  <div>
                    <p className="font-semibold text-white">
                      Mission cycle complete
                    </p>
                    <p className="text-xs text-white/60">
                      We will notify you when the next mission wave arrives.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white"
                  onClick={() => setShowHistory(true)}
                >
                  Review history
                </Button>
              </div>
            ) : (
              missionList
            )}
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-wide text-white/45">
              {allMissionsClaimed ? "Next steps" : "Coming soon"}
            </p>
            <p className="mt-1 text-xs text-white/45">
              {allMissionsClaimed
                ? "Explore community challenges or check back tomorrow for refreshed missions."
                : "New missions arrive weekly. Keep an eye on this space."}
            </p>
          </div>
        </div>
      </Card>

      <Dialog
        open={!!celebrationMission}
        onOpenChange={(open) => {
          if (!open) {
            setCelebrationMission(null);
          }
        }}
      >
        <DialogContent className="bg-[#090909] text-white border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <PartyPopper size={20} className="text-amber-200" />
              Mission ready to claim
            </DialogTitle>
            {celebrationMission && (
              <DialogDescription className="text-sm text-white/60">
                {celebrationMission.title}
              </DialogDescription>
            )}
          </DialogHeader>
          {celebrationMission && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">
                You just unlocked
                <span className="ml-1 font-semibold text-white">
                  {celebrationMission.xpShares.toLocaleString("en-US")} XP
                  Shares
                </span>
                . Claim them before moving to the next mission.
              </p>
            </div>
          )}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              className="w-full border border-white/10 bg-transparent text-white/70 hover:text-white"
              onClick={() => {
                if (celebrationMission) {
                  handleStartMission(celebrationMission);
                }
                setCelebrationMission(null);
              }}
            >
              Adjust deposit
            </Button>
            <Button
              className="w-full bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
              onClick={() => {
                if (celebrationMission) {
                  handleClaim(celebrationMission);
                }
              }}
              disabled={
                !celebrationMission || claimingMissionId === celebrationMission.id
              }
            >
              {celebrationMission && claimingMissionId === celebrationMission.id
                ? "Claiming..."
                : "Claim reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
