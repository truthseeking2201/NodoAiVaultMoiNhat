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
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";

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
    <DetailWrapper
      title="LP Outcome Simulator"
      titleComponent={
        <div className="flex items-center gap-x-4">
          <p className="text-[11px] uppercase tracking-wide text-white/50">
            {headlineCopy}
          </p>
          <button
            type="button"
            onClick={toggle}
            className="flex items-center justify-between text-left"
            aria-expanded={expanded}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              className="rounded-full border border-white/15 bg-white/10 p-2"
            >
              <ChevronDown className="h-4 w-4 text-white/80" />
            </motion.div>
          </button>
        </div>
      }
    >
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="pt-4"
          >
            <LpSimulator
              value={input}
              onChange={(next) => updateInput(vaultId, next)}
              withPadding={false}
            />
            <div className="mt-6 border-t border-white/10 pt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
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
    </DetailWrapper>
  );
}
