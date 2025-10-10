import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Gift, Users, Wallet } from "lucide-react";

type MissionStatus = "available" | "eligible" | "claimed" | "locked";

export type Mission = {
  id: string;
  icon: "wallet" | "gift" | "users";
  title: string;
  cta: string;
  thresholdUsd: number;
  rewardGems: number;
  status: MissionStatus;
};

const ICONS: Record<Mission["icon"], JSX.Element> = {
  wallet: <Wallet size={18} className="text-white/80" />,
  gift: <Gift size={18} className="text-white/80" />,
  users: <Users size={18} className="text-white/80" />,
};

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: "welcome_5",
    icon: "wallet",
    title: "Deposit $5 to earn 500 GEMs",
    cta: "Deposit Now",
    thresholdUsd: 5,
    rewardGems: 500,
    status: "available",
  },
  {
    id: "levelup_50",
    icon: "gift",
    title: "Deposit $50 to earn 2,000 GEMs",
    cta: "Deposit Now",
    thresholdUsd: 50,
    rewardGems: 2000,
    status: "available",
  },
  {
    id: "streak_3d",
    icon: "users",
    title: "Complete a 3-day deposit streak for 3,000 GEMs",
    cta: "Start Streak",
    thresholdUsd: 0,
    rewardGems: 3000,
    status: "locked",
  },
];

type MissionsCardProps = {
  missions?: Mission[];
  onDepositPrefill: (usdAmount: number) => void;
  isDepositDisabled?: boolean;
  disabledReason?: string;
  className?: string;
};

export function MissionsCard({
  missions = DEFAULT_MISSIONS,
  onDepositPrefill,
  isDepositDisabled,
  disabledReason,
  className,
}: MissionsCardProps) {
  const [primaryMissions, upcomingMissions] = useMemo(() => {
    const active = missions.slice(0, 3);
    const upcoming = missions.slice(3);
    return [active, upcoming];
  }, [missions]);

  return (
    <section
      className={cn(
        "glass-card rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur-md",
        className
      )}
      aria-labelledby="missions-card-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            id="missions-card-heading"
            className="text-xs uppercase tracking-[0.25em] text-white/60"
          >
            Complete missions to get more rewards
          </p>
          <p className="mt-2 text-sm text-white/80">
            Prefilled deposits keep you on track without extra clicks.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {primaryMissions.map((mission) => {
          const isActionDisabled =
            isDepositDisabled || mission.status === "claimed";
          const isLocked = mission.status === "locked";

          return (
            <article
              key={mission.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  {ICONS[mission.icon]}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white/90 md:text-base">
                    {mission.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-8 px-3 text-xs uppercase tracking-wide text-white transition",
                        "border-white/20 bg-white/5 hover:bg-white/10",
                        (isActionDisabled || isLocked) &&
                          "cursor-not-allowed opacity-40 hover:bg-white/5"
                      )}
                      onClick={() =>
                        onDepositPrefill(
                          mission.thresholdUsd > 0 ? mission.thresholdUsd : 0
                        )
                      }
                      disabled={isActionDisabled || isLocked}
                      aria-disabled={isActionDisabled || isLocked}
                    >
                      {mission.status === "claimed"
                        ? "Claimed"
                        : mission.status === "locked"
                        ? "Locked"
                        : mission.cta}
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                    {isDepositDisabled && (
                      <span className="text-xs text-orange-300">
                        {disabledReason ??
                          "Mission locked while safety checks are in progress."}
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-white/60">
                        Complete earlier missions first.
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/90 tabular-nums">
                  <img
                    src="/gem.svg"
                    alt="GEM reward"
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  {mission.rewardGems.toLocaleString("en-US")}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="my-6 border-t border-white/10" />

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
          Coming soon
        </p>
        {upcomingMissions.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">
            New missions arrive weekly. Keep an eye on this space.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcomingMissions.map((mission) => (
              <li
                key={mission.id}
                className="text-sm text-white/50"
              >
                {mission.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

