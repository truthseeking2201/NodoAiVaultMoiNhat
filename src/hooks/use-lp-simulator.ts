import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SimulatorInput } from "@/components/simulator/types";

interface LpSimulatorStore {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  currentVaultId?: string;
  setCurrentVaultId: (vaultId?: string) => void;
  inputs: Record<string, SimulatorInput>;
  updateInput: (vaultId: string, value: SimulatorInput) => void;
  patchInput: (vaultId: string, patch: Partial<SimulatorInput>) => void;
  resetInput: (vaultId: string) => void;
  inlineExpanded: Record<string, boolean>;
  setInlineExpanded: (vaultId: string, expanded: boolean) => void;
  dismissedMobileCTA: Record<string, boolean>;
  dismissMobileCTA: (vaultId: string) => void;
  markFirstOpen: (vaultId: string) => void;
  hasOpenedOnce: Record<string, boolean>;
}

export const DEFAULT_SIMULATOR_INPUT: SimulatorInput = {
  depositAmount: 1000,
  baseOrQuote: "base",
  priceChangePct: 0,
  horizon: "7D",
};

export const useLpSimulatorStore = create<LpSimulatorStore>()(
  persist(
    (set, get) => ({
      drawerOpen: false,
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      currentVaultId: undefined,
      setCurrentVaultId: (vaultId) => set({ currentVaultId: vaultId }),
      inputs: {},
      updateInput: (vaultId, value) =>
        set({
          inputs: {
            ...get().inputs,
            [vaultId]: value,
          },
        }),
      patchInput: (vaultId, patch) => {
        const current = get().inputs[vaultId] || { ...DEFAULT_SIMULATOR_INPUT };
        set({
          inputs: {
            ...get().inputs,
            [vaultId]: {
              ...current,
              ...patch,
            },
          },
        });
      },
      resetInput: (vaultId) =>
        set({
          inputs: {
            ...get().inputs,
            [vaultId]: { ...DEFAULT_SIMULATOR_INPUT },
          },
        }),
      inlineExpanded: {},
      setInlineExpanded: (vaultId, expanded) =>
        set({
          inlineExpanded: {
            ...get().inlineExpanded,
            [vaultId]: expanded,
          },
        }),
      dismissedMobileCTA: {},
      dismissMobileCTA: (vaultId) =>
        set({
          dismissedMobileCTA: {
            ...get().dismissedMobileCTA,
            [vaultId]: true,
          },
        }),
      hasOpenedOnce: {},
      markFirstOpen: (vaultId) =>
        set({
          hasOpenedOnce: {
            ...get().hasOpenedOnce,
            [vaultId]: true,
          },
        }),
    }),
    {
      name: "lp-simulator-store",
      version: 2,
      partialize: (state) => ({
        inputs: state.inputs,
        inlineExpanded: state.inlineExpanded,
        dismissedMobileCTA: state.dismissedMobileCTA,
        hasOpenedOnce: state.hasOpenedOnce,
      }),
    }
  )
);

export const ensureSimulatorInput = (vaultId?: string) => {
  if (!vaultId) return;
  const store = useLpSimulatorStore.getState();
  if (!store.inputs[vaultId]) {
    store.updateInput(vaultId, { ...DEFAULT_SIMULATOR_INPUT });
  }
};

export const getSimulatorInput = (vaultId?: string) => {
  if (!vaultId) {
    return { ...DEFAULT_SIMULATOR_INPUT };
  }
  const store = useLpSimulatorStore.getState();
  return store.inputs[vaultId] || { ...DEFAULT_SIMULATOR_INPUT };
};
