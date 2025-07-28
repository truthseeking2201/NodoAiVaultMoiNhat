import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import debounce from "lodash-es/debounce";

import SummaryConfirmWithraw from "./summary-confirm-withdraw";
import { Button } from "@/components/ui/button";
import { RowItem } from "@/components/ui/row-item";
import { Loader } from "@/components/ui/loader";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { IconCheckSuccess } from "@/components/ui/icon-check-success";
import { Badge } from "@/components/ui/badge";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Info, Clock4 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { showFormatNumber } from "@/lib/number";
import LpType from "@/types/lp.type";
import { useToast } from "@/components/ui/use-toast";
import {
  useEstWithdrawVault,
  useWithdrawVault,
} from "@/hooks/use-withdraw-vault";
import { useWallet, useWhiteListModalStore, useWhitelistWallet } from "@/hooks";

type Props = {
  balanceLp: number;
  lpData: LpType;
  onSuccess: () => void;
};
interface IFormInput {
  amount: number;
}

export default function WithdrawForm({ balanceLp, lpData, onSuccess }: Props) {
  const count = useRef<number>(0);
  const summary_default = {
    amount: 0,
    receive: 0,
    fee: 0,
    rateFee: 0.5,
  };
  const min_amount = 0.01;
  const [summary, setSummary] = useState(summary_default);
  const [timeCoolDown, setTimeCoolDown] = useState<string>("");
  const [form, setForm] = useState<IFormInput>();
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalSuccess, setOpenModalSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const BadgeCoolDown = (
    <Badge variant="warning" className="w-full p-4 rounded-xl block">
      <div className="flex items-center mb-1">
        <Clock4 size={14} className="flex-shrink-0" />{" "}
        <span className="text-sm text-white font-medium	ml-1.5 capitalize">
          Withdrawal Cooldown Time
        </span>
      </div>
      <p className="m-0 font-normal text-xs">
        After confirming your withdrawal, please wait up to{" "}
        <span className="text-nodi-gradient font-black">{timeCoolDown}</span>{" "}
        for processing. Once ready, you can claim your funds back to your
        wallet.
      </p>
    </Badge>
  );
  /**
   * HOOKS
   */
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({ mode: "all" });
  const { address } = useWallet();
  const { toast } = useToast();
  const { withdraw } = useWithdrawVault();
  const { amountEst, configVault } = useEstWithdrawVault(
    form?.amount || 0,
    lpData
  );
  const { isWhitelisted } = useWhitelistWallet();
  const { setIsOpen: openWhiteListModal } = useWhiteListModalStore();

  /**
   * FUNCTION
   */
  const onSubmit = (data) => {
    setForm(data);
    setOpenModalConfirm(true);
  };

  const onCloseModalConfirm = useCallback(() => {
    if (isLoading) return;
    setOpenModalConfirm(false);
  }, [isLoading]);

  const onCloseModalSuccess = () => {
    setOpenModalSuccess(false);
    reset();
    onSuccess();
  };

  const handleMaxAmount = useCallback(() => {
    setValue("amount", balanceLp, { shouldValidate: true });
  }, [balanceLp, setValue]);

  const handleFormChange = useCallback((data: IFormInput) => {
    setForm(data);
  }, []);

  const onWithdraw = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await withdraw(form.amount, summary.fee, lpData);
      setOpenModalSuccess(true);
      onCloseModalConfirm();
    } catch (error) {
      console.log(error);
      toast({
        title: "Withdraw failed",
        description: error?.message || error,
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
    }
    setIsLoading(false);
  }, [form, summary, lpData, onCloseModalConfirm, toast, withdraw]);

  /**
   * LIFECYCLES
   */
  useEffect(() => {
    setSummary(amountEst);
  }, [amountEst]);

  useEffect(() => {
    const duration = Math.floor(
      Number(configVault?.lock_duration_ms || 0) / 1000
    );
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration - hours * 3600) / 60);
    const getText = (num) => (num == 1 ? "" : "s");
    if (hours > 0) {
      setTimeCoolDown(`${hours} hour${getText(hours)}`);
    } else if (minutes > 0) {
      setTimeCoolDown(`${minutes} minute${getText(minutes)}`);
    } else {
      setTimeCoolDown(`${duration} second${getText(duration)}`);
    }
  }, [configVault.lock_duration_ms]);

  useEffect(() => {
    const debouncedCb = debounce((formValue) => {
      handleFormChange(formValue);
    }, 500);

    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, handleFormChange]);

  /**
   * RENDER
   */
  return (
    <div>
      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between">
          <div className="font-body text-gray-400 !font-medium">
            Withdraw Amount ({lpData.lp_symbol})
          </div>
          <div className="font-body text-gray-400">
            Available:{" "}
            <span className="font-mono text-white">
              {balanceLp} {lpData.lp_symbol}
            </span>
          </div>
        </div>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: true,
            min: min_amount,
            max: balanceLp,
            pattern: /^\d*\.?\d{0,2}$/,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormattedNumberInput
              value={value ? `${value}` : ""}
              onChange={onChange}
              onBlur={onBlur}
              onMaxAmount={handleMaxAmount}
            />
          )}
        />
        {errors.amount?.type && (
          <div className="text-red-error text-sm mt-1 flex items-center">
            <Info size={18} className="mr-2" />
            {(() => {
              if (errors.amount?.type === "required") {
                return "Please enter withdrawal amount";
              } else if (errors.amount?.type === "pattern") {
                return "Invalid withdrawal amount";
              } else if (errors.amount?.type === "max") {
                return `Insufficient ${lpData.lp_symbol} balance.`;
              } else if (errors.amount?.type === "min") {
                return `Please enter a valid amount`;
              }
            })()}
          </div>
        )}

        {/* Summary */}
        <div className="mb-5 p-4 border border-white/15 rounded-xl mt-5">
          <div className="mb-3 text-gray-200 font-medium">Withdraw Summary</div>
          <hr className="w-full border-t border-white/15" />
          <RowItem label="Amount" className="mt-3">
            {summary?.amount
              ? `${showFormatNumber(summary.amount)} ${lpData.lp_symbol}`
              : "--"}
          </RowItem>
          <RowItem label="Rate" className="mt-3">
            1 {lpData.lp_symbol} ={" "}
            {showFormatNumber(configVault?.lpToTokenRate)} {lpData.token_symbol}
          </RowItem>
          <RowItem label="Est. Receive Amount" className="mt-3">
            {summary?.receive
              ? `${showFormatNumber(summary.receive)} ${lpData.token_symbol}`
              : "--"}
          </RowItem>
          <RowItem className="mt-3">
            <RowItem.Label>
              Withdraw Fee
              <span className="text-gray-200 font-mono ml-2">
                ({summary?.rateFee || 0}%)
              </span>
            </RowItem.Label>
            <RowItem.Value>
              {summary?.amount
                ? `${showFormatNumber(summary.fee)} ${lpData.token_symbol}`
                : "--"}
            </RowItem.Value>
          </RowItem>
        </div>

        {BadgeCoolDown}

        <Button
          type={isWhitelisted ? "submit" : "button"}
          variant="primary"
          size="xl"
          className="w-full font-semibold text-lg mt-5"
          onClick={() => {
            if (!isWhitelisted) {
              openWhiteListModal(true);
              return;
            }
          }}
        >
          Withdraw
        </Button>
      </form>

      {/* modal confirm */}
      <Dialog
        open={openModalConfirm}
        onOpenChange={(isOpen) => !isOpen && onCloseModalConfirm()}
      >
        <DialogContent className="sm:max-w-[480px] bg-[#141517] border border-white/10 p-0 rounded-2xl gap-8">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-0 relative">
            <DialogTitle className="text-xl font-bold m-0">
              Confirm Your Withdrawal
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm Your Withdrawal
            </DialogDescription>
          </DialogHeader>
          {/* Content */}
          <div className="px-6">
            <SummaryConfirmWithraw
              summary={summary}
              lpData={lpData}
              address={address}
              configVault={configVault}
            />
            <div className="mt-4">{BadgeCoolDown}</div>
          </div>
          {/* Footer */}
          <DialogFooter className="px-6 pb-6 w-full flex sm:space-x-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full font-semibold text-base px-2 mr-2"
              onClick={onCloseModalConfirm}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full font-semibold text-base px-2 flex items-center [&_svg]:size-5"
              onClick={onWithdraw}
              disabled={isLoading}
            >
              {isLoading && <Loader />}{" "}
              {isLoading ? "Waiting" : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* modal success */}
      <Dialog
        open={openModalSuccess}
        onOpenChange={(isOpen) => !isOpen && onCloseModalSuccess()}
      >
        <DialogContent
          className="sm:max-w-[480px] bg-[#141517] border border-white/10 px-7 py-8 rounded-2xl gap-5"
          hideIconClose={true}
        >
          <DialogHeader className="relative">
            <div className="flex items-center justify-center mb-5">
              <IconCheckSuccess />
            </div>
            <DialogTitle className="text-xl font-bold m-0 text-center">
              Withdrawal Request Confirmed!
            </DialogTitle>
            <DialogDescription className="m-0 text-center text-base text-gray-400">
              Your {showFormatNumber(summary?.amount)} {lpData.lp_symbol}{" "}
              withdrawal request from Nodo AI Vault has been confirmed. Funds
              will be available after the{" "}
              <span className="whitespace-nowrap">{timeCoolDown}</span>{" "}
              cooldown.
            </DialogDescription>
          </DialogHeader>
          <SummaryConfirmWithraw
            summary={summary}
            lpData={lpData}
            address={address}
            configVault={configVault}
          />
          <div className="">
            <Button
              variant="primary"
              size="lg"
              className="w-full font-semibold text-base px-2 "
              onClick={onCloseModalSuccess}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
