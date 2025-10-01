import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";
import LpSimulator from "@/components/simulator/lp-simulator";
import {
  DEFAULT_SIMULATOR_INPUT,
  ensureSimulatorInput,
  useLpSimulatorStore,
} from "@/hooks/use-lp-simulator";

interface LpSimulatorModalProps {
  vaultId?: string;
}

export function LpSimulatorModal({ vaultId }: LpSimulatorModalProps) {
  const open = useLpSimulatorStore((s) => s.drawerOpen);
  const setOpen = useLpSimulatorStore((s) => s.setDrawerOpen);
  const updateInput = useLpSimulatorStore((state) => state.updateInput);
  const input = useLpSimulatorStore(
    (state) => (vaultId ? state.inputs[vaultId] : undefined)
  ) ?? { ...DEFAULT_SIMULATOR_INPUT };

  useEffect(() => {
    ensureSimulatorInput(vaultId);
  }, [vaultId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-[960px] border border-white/[0.08] bg-[#0C0D0F]/95 backdrop-blur-xl rounded-[28px] px-10 py-8 gap-0 shadow-[0_28px_80px_-20px_rgba(7,11,30,0.6)]">
        <DialogHeader className="flex flex-row items-start justify-between pb-6">
          <div>
            <DialogTitle className="text-2xl font-semibold text-white">
              LP Outcome Simulator
            </DialogTitle>
            <DialogDescription className="text-white/65 mt-2">
              Model price moves, compare against holding, and explore fee / IL impact before committing capital.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/8 hover:bg-white/12 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {vaultId ? (
          <LpSimulator
            value={input}
            onChange={(next) => updateInput(vaultId, next)}
            withPadding={false}
          />
        ) : (
          <div className="py-16 text-center text-white/45 text-sm">
            Pick a vault to launch the simulator.
          </div>
        )}

        <footer className="pt-6 border-t border-white/8 mt-10 text-xs text-white/40 leading-relaxed">
          Simulation results are illustrative only. Market conditions, fees, and execution can differ from estimates.
        </footer>
      </DialogContent>
    </Dialog>
  );
}
