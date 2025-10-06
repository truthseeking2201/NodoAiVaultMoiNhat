import { useState } from "react";
import { isMockMode } from "@/config/mock";
import { useWallet } from "@/hooks/use-wallet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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

  const shouldRender = isMockMode && !disabled;

  const wallet = address ?? undefined;
  const streak = useStreak(vaultId, wallet);
  const { record, progress, events } = streak;

  const current = record?.current ?? 0;
  const hasWallet = Boolean(wallet);

  const label = hasWallet
    ? `Streak: ${current} day${current === 1 ? "" : "s"}`
    : "Start a streak";

  if (!shouldRender) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group relative flex min-w-[140px] flex-col gap-2 rounded-xl border border-white/10 bg-[#101114] px-4 py-2 text-left transition hover:border-white/20 hover:bg-[#15161A] focus:outline-none",
                  className
                )}
              >
                <div className="text-xs uppercase tracking-wide text-white/50">
                  Vault streak
                </div>
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "font-mono text-sm",
                      hasWallet ? "text-white" : "text-white/40"
                    )}
                  >
                    {label}
                  </div>
                  <Progress
                    value={progress.percent}
                    className="h-1 bg-white/5"
                    indicatorClassName="bg-gradient-to-r from-[#64E1B4] via-[#3FA1F7] to-[#8265F7]"
                  />
                </div>
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs text-white/80">
            {TOOLTIP_COPY}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <StreakModal
        record={record}
        events={events}
        vaultId={vaultId}
        wallet={wallet}
      />
    </Dialog>
  );
};
