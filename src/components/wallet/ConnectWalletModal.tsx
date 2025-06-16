import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CASES, STEPS } from "@/components/wallet/constants.ts";
import WalletList from "@/components/wallet/WalletList";
import InputReferral from "@/components/wallet/InputReferral";
import ExistingUser from "@/components/wallet/ExistingUser";
import SuccessReferral from "@/components/wallet/SuccessReferral";
import ConfirmReferral from "@/components/wallet/ConfirmReferral";
import type { UserType } from "@/types/user";
import {
  confirmUserExists,
  linkReferralCode,
  getWalletDetail,
} from "@/apis/wallet";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSearchParams } from "react-router-dom";
import { sleep } from "@/lib/utils";

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
  const [user, setUser] = useState<UserType>(null);
  const [linkRefCode, setLinkRefCode] = useState<string | null>(null);
  const [isFirstConnect, setIsFirstConnect] = useState(true);
  const [isCheckedExistingUser, setIsCheckedExistingUser] = useState(false);
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();

  const handleClosePopup = () => {
    onClose();
    window.sessionStorage.removeItem("ref-code");
  };

  const handleGetWalletDetail = useCallback(async (successAddress: string) => {
    try {
      const res = await getWalletDetail(successAddress);
      setIsFirstConnect(false);
      return res;
    } catch (error) {
      console.error("Error checking old user:", error);
      toast({
        title: "Error",
        description: "Failed to check if user is already signed up.",
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
    }
  }, []);

  const handleCheckExistingUser = async (successAddress: string) => {
    try {
      const walletDetail = await getWalletDetail(successAddress);
      if (walletDetail?.invite_code?.nodo_account) {
        setUser(walletDetail);
        setUserType(CASES.EXISTING_USER);
        setIsCheckedExistingUser(true);
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
    }
  };

  const handleConfirmExistingUser = async (successAddress: string) => {
    try {
      await sleep(1000);
      await confirmUserExists({
        wallet_address: successAddress,
      });
    } catch (error) {
      console.error("Error checking existing user:", error);
    }
  };

  const handleLinkReferralCode = async (
    referralCode: string,
    successAddress?: string
  ) => {
    try {
      await sleep(1000); // waiting connect wallet
      const res = await linkReferralCode({
        user_wallet: successAddress,
        invite_code: referralCode,
      });
      if (res.success) {
        setStep(STEPS.REFERRAL_SUCCESS);
      } else {
        toast({
          title: "Failed to link referral code. Please re-connect your wallet.",
          description: res?.message,
          variant: "error",
          duration: 5000,
          icon: <IconErrorToast />,
        });
        handleClosePopup();
      }
    } catch (error) {
      console.error("Error linking referral code:", error);
    }
  };

  const handleUserTypeStep = (chosenStep?: string, successAddress?: string) => {
    const tempType = userType;
    switch (tempType) {
      case CASES.EXISTING_USER:
        handleExistingUser(step, chosenStep);
        break;
      case CASES.NEW_USER_WITHOUT_REFERRAL:
        handleNewUserWithoutReferral(step);
        break;
      case CASES.NEW_USER_WITH_REFERRAL:
        handleNewUserWithReferral(step, successAddress);
        break;
      default:
        console.error("Unknown user type");
        break;
    }
  };

  const handleNextStep = async (
    chosenStep?: string,
    successAddress?: string
  ) => {
    if (STEPS.REFERRAL_CONFIRM === step) {
      handleUserTypeStep(chosenStep, successAddress);
      return;
    }
    if (isFirstConnect) {
      const walletDetail = await handleGetWalletDetail(successAddress);
      if (walletDetail.invite_code) {
        // If the user is already signed up
        // toast({
        //   title: "You are already signed up!",
        //   variant: "success",
        //   duration: 5000,
        //   icon: <IconCheckSuccess />,
        // });

        handleClosePopup();
      } else if (!walletDetail.data) {
        // If wallet detail is null, it means the first connect
        if (!isCheckedExistingUser) {
          await sleep(2000); // wait for wallet connection
          await handleCheckExistingUser(successAddress);
        }
        handleUserTypeStep(chosenStep, successAddress);
      }
    } else {
      handleUserTypeStep(chosenStep, successAddress);
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
        handleConfirmExistingUser(currentAccount?.address).then(() => {
          handleClosePopup();
        });
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
        handleClosePopup();
        break;
      default:
        console.warn("Unknown step:", currentStep);
        break;
    }
  };

  const handleNewUserWithReferral = async (
    currentStep: string,
    successAddress?: string
  ) => {
    switch (currentStep) {
      case STEPS.REFERRAL_CONFIRM:
        setStep(STEPS.CONNECT_WALLET);
        break;
      case STEPS.CONNECT_WALLET:
        await handleLinkReferralCode(linkRefCode, successAddress);
        break;
      case STEPS.REFERRAL_SUCCESS:
        handleClosePopup();
        break;
      default:
        console.warn("Unknown step:", currentStep);
        break;
    }
  };

  useEffect(() => {
    let linkRefCode = searchParams.get("invite-ref");
    if (linkRefCode) {
      linkRefCode = linkRefCode.replace(/ /g, "+");
      setUserType(CASES.NEW_USER_WITH_REFERRAL);
      setStep(STEPS.REFERRAL_CONFIRM);
      setLinkRefCode(linkRefCode);
    }
  }, [open]);

  useEffect(() => {
    // handle userType doesnot change
    if (userType === CASES.EXISTING_USER) {
      handleNextStep();
    }
  }, [userType]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClosePopup()}
    >
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
            onClick={handleClosePopup}
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
          <WalletList
            onConnectSuccess={(successAddress) =>
              handleNextStep(null, successAddress)
            }
          />
        )}
        <div>
          {step === STEPS.EXISTING_USER_CONFIRM && (
            <ExistingUser onNextStep={handleNextStep} user={user} />
          )}
          {step === STEPS.INPUT_REFERRAL && (
            <InputReferral
              onClose={handleClosePopup}
              onNextStep={(referralCode) => {
                handleNextStep();
                setLinkRefCode(referralCode);
              }}
            />
          )}
          {step === STEPS.REFERRAL_SUCCESS && (
            <SuccessReferral
              linkRefCode={linkRefCode}
              onNextStep={handleNextStep}
            />
          )}
          {step === STEPS.REFERRAL_CONFIRM && (
            <ConfirmReferral
              onNextStep={handleNextStep}
              linkRefCode={linkRefCode}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
