import ReferralSuccessIcon from "@/assets/images/wallet/referral-success.png";
import { ArrowRight } from "lucide-react";
import type { UserType } from "@/types/user";
import { Button } from "@/components/ui/button";

type SuccessReferralProps = {
  user: UserType;
  onNextStep: () => void;
};

const SuccessReferral = ({ user, onNextStep }: SuccessReferralProps) => {
  console.log("SuccessReferral user:", user);
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4 w-full">
      <img src={ReferralSuccessIcon} alt="Success" className="w-16 h-16 mb-6" />
      <div className="text-xl font-bold text-white mb-2 text-center">
        Referral Applied Successfully!
      </div>
      <div className="text-gray-400 mb-6 text-center text-base">
        You've been successfully referred with
        <br /> code{" "}
        <span className="font-bold text-white">{user?.invite_code?.code}</span>.
        Both you and your referrer
        <br /> will receive bonuses when you make your
        <br /> first deposit.
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={onNextStep}
        className="w-full font-semibold text-lg h-[44px] rounded-lg"
      >
        Continue to App
        <ArrowRight size={16} className="ml-2 inline" />
      </Button>
    </div>
  );
};
export default SuccessReferral;
