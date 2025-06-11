import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CASES, STEPS } from "@/components/wallet/constants.ts";
import WalletList from "@/components/wallet/WalletList";
import InputReferral from "@/components/wallet/InputReferral";
import ExistingUser from "@/components/wallet/ExistingUser";
import SuccessReferral from "@/components/wallet/SuccessReferral";
import ConfirmReferral from "@/components/wallet/ConfirmReferral";
import type { UserType } from "@/types/user";

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function ConnectWalletModal({
  open,
  onClose,
  onConnected,
}: ConnectWalletModalProps) {
  const [step, setStep] = useState(STEPS.CONNECT_WALLET);
  const [userType, setUserType] = useState(CASES.NEW_USER_WITHOUT_REFERRAL);
  const [user, setUser] = useState<UserType>({
    name: "John Doe",
    email: "demo@gmail.com",
    referralCode: "NODO123",
  });
  const [linkRefCode, setLinkRefCode] = useState<string | null>(null);

  const handleNextStep = (chosenStep?: string) => {
    switch (userType) {
      case CASES.EXISTING_USER:
        handleExistingUser(step, chosenStep);
        break;
      case CASES.NEW_USER_WITHOUT_REFERRAL:
        handleNewUserWithoutReferral(step);
        break;
      case CASES.NEW_USER_WITH_REFERRAL:
        handleNewUserWithReferral(step);
        break;
      default:
        console.error("Unknown user type");
        break;
    }
  };

  const handleExistingUser = (currentStep: string, chosenStep: string) => {
    if (chosenStep) {
      setStep(chosenStep);
      return;
    }

    switch (currentStep) {
      case STEPS.CONNECT_WALLET:
        setStep(STEPS.EXISTING_USER_CONFIRM);
        break;
      case STEPS.EXISTING_USER_CONFIRM:
        console.log("Existing user confirmed");
        onClose();
        break;
      default:
        console.warn("Unknown step:", currentStep);
        break;
    }
  };

  const handleNewUserWithoutReferral = (currentStep: string) => {
    switch (currentStep) {
      case STEPS.CONNECT_WALLET:
        setStep(STEPS.INPUT_REFERRAL);
        break;
      case STEPS.INPUT_REFERRAL:
        setStep(STEPS.REFERRAL_SUCCESS);
        break;
      case STEPS.REFERRAL_SUCCESS:
        onClose();
        break;
      default:
        console.warn("Unknown step:", currentStep);
        break;
    }
  };

  const handleNewUserWithReferral = (currentStep: string) => {
    switch (currentStep) {
      case STEPS.REFERRAL_CONFIRM:
        setStep(STEPS.CONNECT_WALLET);
        break;
      case STEPS.CONNECT_WALLET:
        setStep(STEPS.REFERRAL_SUCCESS);
        break;
      case STEPS.REFERRAL_SUCCESS:
        onClose();
        break;
      default:
        console.warn("Unknown step:", currentStep);
        break;
    }
  };

  useEffect(() => {
    const linkRefCode = window.sessionStorage.getItem("ref-code");
    if (linkRefCode) {
      setUserType(CASES.NEW_USER_WITH_REFERRAL);
      setStep(STEPS.REFERRAL_CONFIRM);
      setLinkRefCode(linkRefCode);
      window.sessionStorage.removeItem("ref-code");
    } else {
      setUserType(CASES.NEW_USER_WITHOUT_REFERRAL);
      setStep(STEPS.CONNECT_WALLET);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          " bg-[#101112] border border-white/10 p-0 rounded-2xl",
          [
            STEPS.CONNECT_WALLET,
            STEPS.INPUT_REFERRAL,
            STEPS.REFERRAL_SUCCESS,
            STEPS.REFERRAL_CONFIRM,
          ].includes(step)
            ? "sm:max-w-[425px]"
            : "w-full"
        )}
        hideIconClose
        style={{
          boxShadow:
            "0px 10px 15px -3px rgba(255, 255, 255, 0.10), 0px 4px 6px -4px rgba(255, 255, 255, 0.10)",
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-0 relative">
          <button
            className="absolute right-6 top-6 rounded-full h-8 w-8 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {step === STEPS.CONNECT_WALLET && (
            <>
              <DialogTitle className="text-xl font-bold">
                Connect Wallet
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Choose a wallet to connect to Nodo AI Yield Vault
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        {step === STEPS.CONNECT_WALLET && (
          <WalletList onClose={onClose} onNextStep={handleNextStep} />
        )}
        <DialogDescription>
          {step === STEPS.EXISTING_USER_CONFIRM && (
            <ExistingUser onNextStep={handleNextStep} user={user} />
          )}
          {step === STEPS.INPUT_REFERRAL && (
            <InputReferral onClose={onClose} onNextStep={handleNextStep} />
          )}
          {step === STEPS.REFERRAL_SUCCESS && (
            <SuccessReferral user={user} onNextStep={handleNextStep} />
          )}
          {step === STEPS.REFERRAL_CONFIRM && (
            <ConfirmReferral
              onNextStep={handleNextStep}
              linkRefCode={linkRefCode}
            />
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
