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
import { CASES, STEPS, WALLET_STATUS } from "@/components/wallet/constants.ts";
import WalletList from "@/components/wallet/WalletList";
import InputReferral from "@/components/wallet/InputReferral";
import ExistingUser from "@/components/wallet/ExistingUser";
import SuccessReferral from "@/components/wallet/SuccessReferral";
import ConfirmReferral from "@/components/wallet/ConfirmReferral";
import type { UserType } from "@/types/user";
import {
  checkUserExists,
  linkReferralCode,
  checkSubscribeWalletDetails,
} from "@/apis/wallet";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { set } from "date-fns";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const currentAccount = useCurrentAccount();

  const handleGetAddressInfo = useCallback(async () => {
    try {
      const subscribeWalletRes = await checkSubscribeWalletDetails(
        currentAccount?.address
      );
      console.log("subscribeWalletRes", subscribeWalletRes);
      if (subscribeWalletRes) {
        setUser(subscribeWalletRes);
        console.log("User info:", subscribeWalletRes);
      }
    } catch (error) {
      console.error("Error getting address info:", error);
      toast({
        title: "Error",
        description: "Failed to get wallet address information.",
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
    }
  }, [currentAccount?.address]);

  const handleCheckExistingUser = async (successAddress: string) => {
    try {
      setIsLoading(true);
      setIsChecked(true);
      const subscribeWalletRes = await checkSubscribeWalletDetails(
        successAddress
      );

      if (WALLET_STATUS.SIGNED_UP === subscribeWalletRes.status) {
        onClose();
        toast({
          title: "Signed up successfully",
          variant: "success",
          duration: 5000,
        });
      }

      if (subscribeWalletRes.invite_code?.nodo_account) {
        setUser(subscribeWalletRes);
        setUserType(CASES.EXISTING_USER);
      }

      const response = await checkUserExists({
        wallet_address: successAddress,
      });
      if (response?.data) {
        setUser(response.data);
        setUserType(CASES.EXISTING_USER);
        setStep(STEPS.EXISTING_USER_CONFIRM);
      } else {
        setUserType(CASES.NEW_USER_WITHOUT_REFERRAL);
        setStep(STEPS.INPUT_REFERRAL);
      }
    } catch (error) {
      setUserType(CASES.NEW_USER_WITHOUT_REFERRAL);
      setStep(STEPS.INPUT_REFERRAL);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkReferralCode = async (
    referralCode: string,
    successAddress?: string
  ) => {
    try {
      await checkSubscribeWalletDetails(successAddress);

      const res = await linkReferralCode({
        user_wallet: successAddress,
        invite_code: referralCode,
      });
      if (!res.success) {
        toast({
          title: "Failed to link referral code. Please re-connect your wallet.",
          description: res?.message,
          variant: "error",
          duration: 5000,
          icon: <IconErrorToast />,
        });
        onClose();
      } else {
        setStep(STEPS.REFERRAL_SUCCESS);
      }
    } catch (error) {
      console.error("Error linking referral code:", error);
    }
  };

  const handleUserTypeStep = (chosenStep?: string, successAddress?: string) => {
    switch (userType) {
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
    if (userType !== CASES.NEW_USER_WITH_REFERRAL && isChecked) {
      await handleCheckExistingUser(successAddress).then(() => {
        if (isConnected) {
          handleUserTypeStep(chosenStep, successAddress);
        }
      });
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
        onClose();
        break;
      default:
        console.warn("Unknown step:", currentStep);
        break;
    }
  };

  const handleNewUserWithoutReferral = async (currentStep: string) => {
    switch (currentStep) {
      case STEPS.CONNECT_WALLET:
        setStep(STEPS.INPUT_REFERRAL);
        break;
      case STEPS.INPUT_REFERRAL:
        handleGetAddressInfo().then(() => {
          setStep(STEPS.REFERRAL_SUCCESS);
        });
        break;
      case STEPS.REFERRAL_SUCCESS:
        onClose();
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
          <WalletList
            onConnectSuccess={(successAddress) =>
              handleNextStep(null, successAddress)
            }
          />
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
