import { useEffect } from "react";
import {
  DEFAULT_SIMULATOR_INPUT,
  useLpSimulatorStore,
  ensureSimulatorInput,
} from "@/hooks/use-lp-simulator";
import { Button } from "@/components/ui/button";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import LpSimulatorCompact from "@/components/simulator/lp-simulator-compact";

interface LpSimulatorCardProps {
  vaultId: string;
}

export function LpSimulatorCard({ vaultId }: LpSimulatorCardProps) {
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

  return (
    <DetailWrapper
      title="LP Outcome Simulator"
      titleComponent={
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
      }
    >
      <LpSimulatorCompact
        value={input}
        onChange={(next) => updateInput(vaultId, next)}
      />
    </DetailWrapper>
  );
}
