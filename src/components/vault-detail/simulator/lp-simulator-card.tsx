import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  DEFAULT_SIMULATOR_INPUT,
  useLpSimulatorStore,
  ensureSimulatorInput,
} from "@/hooks/use-lp-simulator";
import LpSimulator from "@/components/simulator/lp-simulator";
import { Button } from "@/components/ui/button";

interface LpSimulatorCardProps {
  vaultId: string;
}

export function LpSimulatorCard({ vaultId }: LpSimulatorCardProps) {
  const expanded = useLpSimulatorStore(
    (state) => state.inlineExpanded[vaultId] ?? false
  );
  const setInlineExpanded = useLpSimulatorStore((state) => state.setInlineExpanded);
  const markFirstOpen = useLpSimulatorStore((state) => state.markFirstOpen);
  const dismissMobileCTA = useLpSimulatorStore((state) => state.dismissMobileCTA);
  const setModalOpen = useLpSimulatorStore((state) => state.setDrawerOpen);
  const input = useLpSimulatorStore(
    (state) => state.inputs[vaultId] ?? { ...DEFAULT_SIMULATOR_INPUT }
  );
  const updateInput = useLpSimulatorStore((state) => state.updateInput);

  useEffect(() => {
    ensureSimulatorInput(vaultId);
  }, [vaultId]);

  const headlineCopy = "Model price paths and compare LP returns against holding.";

  const toggle = () => {
    setInlineExpanded(vaultId, !expanded);
    if (!expanded) {
      markFirstOpen(vaultId);
      dismissMobileCTA(vaultId);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E0F10]">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="text-left">
          <div className="text-white font-semibold text-base">
            LP Outcome Simulator
          </div>
          <p className="text-white/60 text-sm mt-1">
            {headlineCopy}
          </p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronDown className="h-5 w-5 text-white" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="px-5 pb-6 pt-2"
          >
            <LpSimulator
              value={input}
              onChange={(next) => updateInput(vaultId, next)}
              withPadding={false}
            />
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:text-white hover:border-white/40"
                onClick={() => {
                  ensureSimulatorInput(vaultId);
                  markFirstOpen(vaultId);
                  dismissMobileCTA(vaultId);
                  setModalOpen(true);
                }}
              >
                Open full simulator
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
