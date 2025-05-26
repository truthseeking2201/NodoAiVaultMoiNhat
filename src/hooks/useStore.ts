import { create } from "zustand";

interface DepositVaultState {
  depositVault: string | null;
  setDepositVault: (depositVault: string) => void;
}

const depositVaultStore = create<DepositVaultState>((set) => ({
  depositVault: null,
  setDepositVault: (depositVault: string) => set({ depositVault }),
}));

export const useDepositVaultStore = () => {
  const depositVault = depositVaultStore((state) => state.depositVault);
  const setDepositVault = depositVaultStore((state) => state.setDepositVault);
  return {
    depositVault,
    setDepositVault,
  };
};
