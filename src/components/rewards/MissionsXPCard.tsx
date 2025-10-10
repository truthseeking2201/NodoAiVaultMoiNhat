import { Card } from "@/components/ui/card";
import { ArrowRight, Gift, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type MissionStatus = "available" | "eligible" | "claimed" | "locked";

type Mission = {
  id: string;
  icon: "wallet" | "gift" | "users";
  title: string;
  thresholdUsd: number;
  xpShares: number;
  status: MissionStatus;
};

const ICONS: Record<Mission["icon"], JSX.Element> = {
  wallet: <Wallet size={16} className="text-white/70" />,
  gift: <Gift size={16} className="text-white/70" />,
  users: <Users size={16} className="text-white/70" />,
};

const DEFAULT_MISSIONS: Mission[] = [
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
  isDepositDisabled?: boolean;
  disabledReason?: string;
  className?: string;
};

export function MissionsXPCard({
  missions = DEFAULT_MISSIONS,
  onDepositPrefill,
  isDepositDisabled,
  disabledReason,
  className,
}: MissionsXPCardProps) {
  return (
    <Card
      className={cn(
        "glass-card rounded-xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur-sm shadow-[0_2px_20px_rgba(0,0,0,0.25)] md:p-6",
        className
      )}
      aria-labelledby="missions-xp-card-heading"
    >
      <div className="mb-3">
        <p
          id="missions-xp-card-heading"
          className="text-base font-bold text-white md:text-lg"
        >
          Complete missions to get more rewards
        </p>
      </div>

      <ul className="divide-y divide-white/10">
        {missions.map((mission) => {
          const isLocked = mission.status === "locked";
          const isAvailable = mission.status === "available";

          return (
            <li key={mission.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    {ICONS[mission.icon]}
                  </div>
                  <p className="text-sm leading-5 text-white/90 md:text-[15px]">
                    {mission.title}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[13px] text-white/85 tabular-nums">
                    XP {mission.xpShares.toLocaleString("en-US")}
                  </span>
                  {isDepositDisabled ? (
                    <span className="text-[13px] text-orange-400">
                      {disabledReason ?? "Temporarily paused"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 text-[13px] text-white/80 transition hover:text-white",
                        !isAvailable && "cursor-not-allowed opacity-40"
                      )}
                      onClick={() => onDepositPrefill(mission.thresholdUsd)}
                      disabled={!isAvailable}
                      aria-label={
                        mission.thresholdUsd
                          ? `Deposit $${mission.thresholdUsd}`
                          : "Start mission"
                      }
                    >
                      {isLocked
                        ? "Locked"
                        : mission.thresholdUsd
                        ? `Deposit $${mission.thresholdUsd}`
                        : "Start"}
                      <ArrowRight size={14} />
                    </button>
                  )}
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

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-wide text-white/45">
          Coming soon
        </p>
        <p className="mt-1 text-xs text-white/45">
          New missions arrive weekly. Keep an eye on this space.
        </p>
      </div>
    </Card>
  );
}
