import { create } from "zustand";

interface DepositVaultState {
  depositVault: string | null;
  setDepositVault: (depositVault: string) => void;
}

const depositVaultStore = create<DepositVaultState>((set) => ({
  depositVault: null,
  setDepositVault: (vaultId: string) => set({ depositVault: vaultId }),
}));

export const useDepositVaultStore = () => {
  const depositVault = depositVaultStore((state) => state.depositVault);
  const setDepositVault = depositVaultStore((state) => state.setDepositVault);
  return {
    depositVault,
    setDepositVault,
  };
};

type WhiteListModalState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const whiteListModalStore = create<WhiteListModalState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export const useWhiteListModalStore = () => {
  const isOpen = whiteListModalStore((state) => state.isOpen);
  const setIsOpen = whiteListModalStore((state) => state.setIsOpen);
  return {
    isOpen,
    setIsOpen,
  };
};
