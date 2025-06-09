import { Button } from "@/components/ui/button";
import ExistingUserIcon from "@/assets/images/wallet/existing-account.png";
import DefaultAvatar from "@/assets/images/wallet/default-avatar.png";
import { ArrowRight } from "lucide-react";
import type { UserType } from "@/types/user";
import { STEPS } from "@/components/wallet/constants.ts";

type ExistingUserProps = {
  onNextStep: (step?: string) => void;
  user: UserType;
};
const ExistingUser = ({ onNextStep, user }: ExistingUserProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4">
      <img src={ExistingUserIcon} alt="Existing User" className="w-16 h-16" />
      <div className="text-2xl font-bold text-white mb-2 text-center">
        Existing Account Detected
      </div>
      <div className="text-gray-400 mb-6 text-center">
        This wallet is linked to your NODO account. Your referral code is now
        active on NODO AI Vaults.
      </div>
      <div className="flex flex-col items-center justify-center mb-6 w-full bg-white/5 py-3 px-4 rounded-lg">
        <img
          src={DefaultAvatar}
          alt="Default Avatar"
          className="w-[42px] h-[42px] mb-4 rounded-full"
        />
        <div className="text-base font-semibold text-white">{user.name}</div>
        <div className="text-sm text-gray-400">{user.email}</div>
        <div className="flex items-center justify-between mt-3 w-full bg-white/15 py-[6px] px-3 rounded-md">
          <div className="text-sm text-gray-400">Referral Code:</div>
          <div className="font-mono font-bold text-sm text-white">
            {user.referralCode}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mb-2 w-full gap-4">
        <Button
          variant="ai-outline"
          size="lg"
          onClick={() => onNextStep(STEPS.CONNECT_WALLET)}
          className="w-full max-w-xs font-semibold text-sm h-[44px] rounded-lg"
        >
          Login with another wallet
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => onNextStep()}
          className="w-full max-w-xs font-semibold text-sm h-[44px] rounded-lg"
        >
          Confirm login
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ExistingUser;
