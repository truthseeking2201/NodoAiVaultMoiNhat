import { Button } from "@/components/ui/button";
import { useLpSimulatorStore, ensureSimulatorInput } from "@/hooks/use-lp-simulator";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LpSimulatorMobileCTAProps {
  vaultId?: string;
}

export function LpSimulatorMobileCTA({ vaultId }: LpSimulatorMobileCTAProps) {
  const { isMobile } = useBreakpoint();
  const {
    drawerOpen,
    setDrawerOpen,
    inlineExpanded,
    dismissedMobileCTA,
    hasOpenedOnce,
    markFirstOpen,
    dismissMobileCTA,
  } = useLpSimulatorStore();

  if (!vaultId || !isMobile) {
    return null;
  }

  const hasExpanded = inlineExpanded[vaultId] ?? false;
  const dismissed = dismissedMobileCTA[vaultId] ?? false;
  const openedOnce = hasOpenedOnce[vaultId] ?? false;

  const shouldShow = !drawerOpen && !hasExpanded && !dismissed && !openedOnce;

  if (!shouldShow) {
    return null;
  }

  const handleOpen = () => {
    ensureSimulatorInput(vaultId);
    setDrawerOpen(true);
    markFirstOpen(vaultId);
    dismissMobileCTA(vaultId);
  };

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <Button
        onClick={handleOpen}
        className={cn(
          "shadow-lg px-5 py-3 text-sm font-semibold text-white",
          "bg-gradient-to-r from-[#FF8A65] via-[#26A69A] to-[#26A69A] border-none"
        )}
      >
        Try LP Simulator
        <ArrowUpRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
