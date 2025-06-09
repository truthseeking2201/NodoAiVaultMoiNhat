import ReferralConfirmIcon from "@/assets/images/wallet/referral-confirm.png";
import { Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmReferralProps = {
  onNextStep: () => void;
  referralCode?: string; // Optional referral code prop
};

const ConfirmReferral = ({
  onNextStep,
  referralCode,
}: ConfirmReferralProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4">
      <img
        src={ReferralConfirmIcon}
        alt="Confirm Referral"
        className="w-[62px] h-[100px] mb-4"
      />
      <div className="text-xl font-bold text-white mb-2 text-center">
        You’ve Been Invited!
      </div>
      <div className="text-gray-400 mb-6 text-center text-base">
        Welcome! Looks like a friend referred you. Just
        <br /> connect your wallet and make a deposit to unlock
        <br /> rewards for both of you.
      </div>
      <div className="border border-[#2C2C2C] rounded-lg px-3 py-2 w-full">
        <span className="font-medium font-mono">{referralCode}</span>
      </div>
      <div className="flex items-center justify-start mb-6 mt-2 w-full">
        <Check size={12} className="text-green-500 mr-2" />
        <span className="text-gray-400 text-sm">
          Code automatically applied from referral link
        </span>
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={onNextStep}
        className="w-full font-semibold text-sm h-[44px] rounded-lg"
      >
        <Wallet size={16} className="mr-2 inline" />
        Connect Wallet
      </Button>
    </div>
  );
};

export default ConfirmReferral;
