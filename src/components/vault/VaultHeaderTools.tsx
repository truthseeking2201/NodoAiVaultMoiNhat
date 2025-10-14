import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Wrench, ExternalLink } from "lucide-react";
import clsx from "clsx";

type VaultHeaderToolsProps = {
  onOpenSimulator?: () => void;
  className?: string;
};

export function VaultHeaderTools({
  onOpenSimulator,
  className,
}: VaultHeaderToolsProps) {
  const openSimulator = () => {
    if (onOpenSimulator) {
      onOpenSimulator();
      return;
    }
    if (typeof window !== "undefined") {
      window.open("/lp-simulator", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Tools"
          className={clsx(
            "h-8 w-8 rounded-full bg-white/5 border border-white/10 p-0 grid place-items-center",
            className
          )}
        >
          <Wrench className="w-4 h-4 text-white/80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-52 p-2 rounded-2xl bg-[#121317] border border-white/10 text-white"
      >
        <button
          onClick={openSimulator}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <span>LP Simulator</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </PopoverContent>
    </Popover>
  );
}
