import { useEffect, useMemo, useRef, useState } from "react";
import { isMockMode } from "@/config/mock";
import { useWallet } from "@/hooks/use-wallet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { MILESTONES, utcDayKey } from "../logic";
import { useStreak } from "../hooks/use-streak";
import { StreakModal } from "./StreakModal";

const TOOLTIP_COPY =
  "Maintained by holding NDLP across midnight UTC or making a deposit once per day.";

type StreakWidgetProps = {
  vaultId: string;
  className?: string;
  disabled?: boolean;
};

export const StreakWidget = ({ vaultId, className, disabled }: StreakWidgetProps) => {
  const { address, isConnected } = useWallet();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const prevCurrent = useRef<number | null>(null);
  const triggeredMilestones = useRef<Set<number>>(new Set());
  const { toast } = useToast();

  const shouldRender = isMockMode && !disabled;

  const wallet = address ?? undefined;
  const streak = useStreak(vaultId, wallet);
  const { record, rewards, stats, progress, events, seedDemo, logEvent } = streak;

  const current = record?.current ?? 0;
  const hasWallet = Boolean(wallet);
  const todayKey = useMemo(() => utcDayKey(Date.now()), []);
  const coveredToday = useMemo(
    () => events.some((event) => event.dayKey === todayKey),
    [events, todayKey]
  );

  useEffect(() => {
    const previous = prevCurrent.current;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (previous !== null && current > previous) {
      setHighlight(true);
      timeout = setTimeout(() => setHighlight(false), 320);
    }
    prevCurrent.current = current;
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [current]);

  const label = useMemo(() => {
    if (!hasWallet) return "Start a streak";
    return `Streak: ${current} day${current === 1 ? "" : "s"}`;
  }, [hasWallet, current]);

  const progressWidth = useMemo(() => {
    if (!hasWallet) return 0;
    return progress.percent;
  }, [hasWallet, progress.percent]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }
    if (!hasWallet) {
      triggeredMilestones.current.clear();
      return;
    }
    if (current === 0) {
      triggeredMilestones.current.clear();
      return;
    }

    triggeredMilestones.current.forEach((milestone) => {
      if (milestone > current) {
        triggeredMilestones.current.delete(milestone);
      }
    });

    if (MILESTONES.includes(current) && !triggeredMilestones.current.has(current)) {
      triggeredMilestones.current.add(current);
      toast({
        title: "Milestone reached",
        description: `${current}-day streak unlocked. Keep it going!`,
        duration: 2600,
      });
    }
  }, [current, hasWallet, shouldRender, toast]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm transition-transform duration-300",
                highlight && "scale-[1.02] drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]",
                className
              )}
            >
              <div className="flex min-w-[150px] flex-col gap-[6px]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Vault Streak
                </div>
                <div
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    hasWallet ? "text-white/90" : "text-white/40"
                  )}
                >
                  {label}
                </div>
                <div className="mt-1 h-[2px] w-full rounded-full bg-white/10">
                  <div
                    className="h-[2px] rounded-full bg-white/70 transition-[width] duration-500 ease-out"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </div>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="ml-1 h-7 rounded-md border border-white/15 px-2 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
                >
                  Details
                </button>
              </DialogTrigger>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs text-white/80">
            {TOOLTIP_COPY}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <StreakModal
        record={record}
        events={events}
        rewards={rewards}
        stats={stats}
        vaultId={vaultId}
        wallet={wallet}
        onSeedDemo={seedDemo}
        onPrimaryAction={
          coveredToday || !wallet
            ? undefined
            : () =>
                logEvent({
                  vaultId,
                  wallet,
                  at: Date.now(),
                  type: "deposit",
                  amountUsd: 150,
                })
        }
        coveredToday={coveredToday}
      />
    </Dialog>
  );
};
