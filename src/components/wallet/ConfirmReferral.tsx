import ReferralConfirmIcon from "@/assets/images/wallet/referral-confirm.png";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmReferralProps = {
  onNextStep: () => void;
};

const ConfirmReferral = ({ onNextStep }: ConfirmReferralProps) => {
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
