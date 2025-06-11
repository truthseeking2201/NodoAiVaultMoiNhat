import ExistingUserIcon from "@/assets/images/wallet/existing-account.png";
import ExistingUserErrorIcon from "@/assets/images/wallet/existing-account-error.png";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleAlert } from "lucide-react";

type InputReferralProps = {
  onClose: () => void;
  onNextStep: () => void;
};

const InputReferral = ({ onClose, onNextStep }: InputReferralProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      referralCode: "",
    },
  });

  const onSubmit = (data: { referralCode: string }) => {
    if (data.referralCode && data.referralCode.length < 5) {
      setError("referralCode", {
        type: "manual",
        message: "Invalid referral code. Please check and try again.",
      });
      return;
    }
    console.log("Referral Code Submitted:", data.referralCode);
    onNextStep();
  };
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-4 w-full">
      <img
        src={errors.referralCode ? ExistingUserErrorIcon : ExistingUserIcon}
        alt="Existing User"
        className="w-16 h-16 mb-6"
      />
      <div className="text-2xl font-bold text-white mb-2 text-center">
        Were You Referred?
      </div>
      <div className="text-gray-400 mb-6 text-center">
        If someone invited you to NODO AI Vaults,
        <br /> enter their referral code below
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-gray-400 mb-2">Referral Code (Optional)</div>
        <Controller
          name="referralCode"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Enter referral code"
              className="w-full px-4 py-2 bg-ai/5 border border-ai/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ai"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
            />
          )}
        />
        {errors.referralCode && (
          <div className="text-red-error text-sm mt-1 font-sans">
            <CircleAlert className="inline-block mr-1" size={16} />
            {errors.referralCode.message}
          </div>
        )}
        <div className="flex items-center justify-center mb-2 w-full gap-4 mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full font-semibold text-sm h-[44px] rounded-lg"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="w-full font-semibold text-sm h-[44px] rounded-lg"
          >
            Continue
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InputReferral;
