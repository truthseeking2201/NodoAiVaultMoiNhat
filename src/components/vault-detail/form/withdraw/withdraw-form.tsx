import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import debounce from "lodash-es/debounce";

import SummaryConfirmWithdraw from "./summary-confirm-withdraw";
import { Button } from "@/components/ui/button";
import Web3Button from "@/components/ui/web3-button";
import { RowItem } from "@/components/ui/row-item";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input-v2";
import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SelectTokens from "./select-tokens";
import ConversationRate from "../conversation-rate";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { showFormatNumber } from "@/lib/number";
import { useCurrentAccount } from "@mysten/dapp-kit";
import LpType from "@/types/lp.type";
import PaymentTokenType from "@/types/payment-token.types";
import { useToast } from "@/components/ui/use-toast";
import {
  useWithdrawVaultConfig,
  useWithdrawVault,
  useWithdrawEtsAmountReceive,
} from "@/hooks/use-withdraw-vault";
import Lottie from "lottie-react";
import successAnimationData from "@/assets/lottie/circle_checkmark_success.json";

type Props = {
  balanceLp: string;
  lpData: LpType;
  tokens: PaymentTokenType[];
  onSuccess: () => void;
};
interface IFormInput {
  amount: number;
}

export default function WithdrawForm({
  balanceLp,
  lpData,
  tokens,
  onSuccess,
}: Props) {
  const min_amount = 0.01;
  const max_decimals = 6;
  const [timeCoolDown, setTimeCoolDown] = useState<string>("");
  const [form, setForm] = useState<IFormInput>();
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalSuccess, setOpenModalSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<PaymentTokenType>();

  const BadgeCoolDown = useMemo(() => {
    return (
      <p className="m-0 text-white/70 font-normal text-xs text-center">
        After confirming your withdrawal, please wait up to{" "}
        <span className="text-apr-gradient font-black">{timeCoolDown}</span> for
        processing. Once ready, you can claim your funds back to your wallet.
      </p>
    );
  }, [timeCoolDown]);

  const balanceInput = useMemo(() => {
    return (
      <span className="text-white/80 text-sm font-medium font-sans">
        {showFormatNumber(balanceLp, 0, max_decimals, "", true)}{" "}
        {lpData.lp_symbol}
      </span>
    );
  }, [balanceLp, lpData.lp_symbol]);

  const rightInput = useMemo(() => {
    return (
      <div className="flex items-center">
        <img
          src={lpData.lp_image}
          alt={lpData.lp_symbol}
          className="w-6 h-6 mr-2"
        />
        <span className="font-mono text-lg font-bold text-gray-200">
          {lpData.lp_symbol}
        </span>
      </div>
    );
  }, [lpData]);

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
  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address;
  const { toast } = useToast();
  const { withdraw } = useWithdrawVault();
  const { configVault } = useWithdrawVaultConfig(lpData);
  const summary = useWithdrawEtsAmountReceive(
    lpData,
    selectedToken,
    form?.amount || 0
  );

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

  const handleFormChange = useCallback((data: IFormInput) => {
    setForm(data);
  }, []);

  const onWithdraw = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await withdraw(
        form.amount,
        lpData,
        selectedToken?.token_address
      );
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
  }, [form, lpData, selectedToken, onCloseModalConfirm, toast, withdraw]);

  /**
   * LIFECYCLES
   */

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

  useEffect(() => {
    if (!tokens.length) return;
    const token_usdc = tokens.find((i) => i.token_symbol == "USDC");
    if (token_usdc) {
      setSelectedToken(token_usdc);
    } else {
      setSelectedToken(tokens[0]);
    }
  }, [tokens]);

  /**
   * RENDER
   */
  return (
    <div>
      <div
        className={`deposit_input_v2_wrapper p-4 !rounded-lg flex items-center justify-between mb-6`}
      >
        <div className="text-gray-200 font-medium	font-sans text-base">
          Select Payout Token
        </div>
        <SelectTokens
          selectedToken={selectedToken}
          tokens={tokens}
          onSelectToken={(token) => {
            setSelectedToken(token);
          }}
          title="Select Payout Token"
        />
      </div>
      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between">
          <div className="font-body text-gray-400 !font-medium mb-2">
            Withdraw Amount
          </div>
        </div>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: {
              value: true,
              message: "Please enter withdrawal amount",
            },
            min: {
              value: min_amount,
              message: `Minimum withdrawal is ${min_amount}`,
            },
            max: {
              value: balanceLp,
              message: `Insufficient ${lpData.lp_symbol} balance.`,
            },
            pattern: {
              value: new RegExp(`^\\d*\\.?\\d{0,${max_decimals}}$`),
              message: "Invalid withdrawal amount",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormattedNumberInput
              value={value ? `${value}` : ""}
              amountAvailable={balanceLp}
              balanceInput={balanceInput}
              rightInput={rightInput}
              maxDecimals={max_decimals}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {(errors?.amount?.message || summary?.errorEstimateWithdraw) && (
          <div className="py-2 px-4 bg-red-error/20 text-red-error text-sm flex items-center">
            <Info size={18} className="mr-2" />
            {errors?.amount?.message || summary?.errorEstimateWithdraw}
          </div>
        )}

        {/* Summary */}
        <div className="p-4 border border-white/15 rounded-[12px] rounded-t-none">
          <RowItem
            className="flex-col !justify-start !items-start"
            classNameValue="w-full mt-2 font-mono text-gray-200 font-bold"
          >
            <RowItem.Label>
              <LabelWithTooltip
                label="Est. Max Receive"
                labelClassName="text-base text-gray-400 font-sans"
                tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
              />
            </RowItem.Label>
            <RowItem.Value>
              <div className="flex items-center justify-between">
                <DynamicFontText
                  maxWidth={245}
                  breakpoints={[
                    { minLength: 0, fontSize: "text-[32px] leading-[42px]" },
                    { minLength: 13, fontSize: "text-lg" },
                    { minLength: 18, fontSize: "text-base" },
                  ]}
                >
                  {summary?.receive
                    ? `${showFormatNumber(
                        summary.receive,
                        0,
                        selectedToken.decimal
                      )} `
                    : "--"}
                </DynamicFontText>
                <div className="flex items-center">
                  <img
                    src={selectedToken?.image}
                    alt={selectedToken?.token_symbol}
                    className="w-6 h-6 mr-2"
                  />
                  <div className="text-lg">{selectedToken?.token_symbol}</div>
                </div>
              </div>
            </RowItem.Value>
          </RowItem>
          <hr className="w-full border-t border-white/15 my-2" />
          <ConversationRate
            sourceToken={{ symbol: summary?.conversion_rate?.from_symbol }}
            targetToken={{ symbol: summary?.conversion_rate?.to_symbol }}
            rate={summary?.conversion_rate.amount}
            isCalculating={summary?.isLoadingEstimateWithdraw}
            onRefresh={summary.refreshRate}
          />

          <RowItem className="mt-2">
            <RowItem.Label>
              <span className="text-sm text-white/80">Transaction Fee</span>
            </RowItem.Label>
            <RowItem.Value>
              <span className="text-sm">Free</span>
            </RowItem.Value>
          </RowItem>
        </div>

        <Web3Button
          type="submit"
          className="w-full font-semibold text-lg py-3 mt-4 mb-3"
          disabled={!summary.receive || !!summary.errorEstimateWithdraw}
        >
          Withdraw
        </Web3Button>

        {BadgeCoolDown}
      </form>

      {/* modal confirm */}
      <Dialog
        open={openModalConfirm}
        onOpenChange={(isOpen) => !isOpen && onCloseModalConfirm()}
      >
        <DialogContent
          hideIconClose
          className="sm:max-w-[480px] bg-[#141517] border border-white/10 gap-6"
        >
          {/* Header */}
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="text-xl font-bold m-0">
              Confirm Your Withdrawal
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm Your Withdrawal
            </DialogDescription>
            <Button
              variant="icon"
              className="w-8 h-8 bg-white/5 text-gray-400 !mt-0"
              onClick={onCloseModalConfirm}
            >
              <X size={20} className="text-white" />
            </Button>
          </DialogHeader>
          {/* Content */}
          <SummaryConfirmWithdraw
            summary={summary}
            lpData={lpData}
            address={address}
            configVault={configVault}
          />
          <div className="mt-4">{BadgeCoolDown}</div>
          {/* Footer */}
          <DialogFooter className="w-full flex sm:space-x-0">
            <Button
              variant="outline"
              size="lg"
              className="font-semibold px-2 h-13 mr-4 !rounded-lg w-[120px] bg-white/5"
              onClick={onCloseModalConfirm}
              disabled={isLoading}
            >
              Back
            </Button>
            <Web3Button
              className="flex-1 font-semibold text-md py-3 rounded-lg	flex items-center justify-center"
              onClick={onWithdraw}
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Waiting" : "Confirm Withdrawal"}
            </Web3Button>
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
            <Lottie
              animationData={successAnimationData}
              loop={false}
              autoplay={true}
              className="w-24 h-24 mx-auto"
            />
            <DialogTitle className="text-xl font-bold m-0 text-center">
              Withdrawal Request Confirmed!
            </DialogTitle>
            <DialogDescription className="m-0 text-center text-base text-gray-400">
              Your {showFormatNumber(summary?.amount)} {lpData.lp_symbol}{" "}
              withdrawal request from Vault {lpData.vault_name} has been
              confirmed. Funds will be available after the cooldown.
            </DialogDescription>
          </DialogHeader>
          <SummaryConfirmWithdraw
            summary={summary}
            lpData={lpData}
            address={address}
            configVault={configVault}
          />
          <Web3Button
            className="w-full font-semibold text-base py-3 rounded-lg"
            onClick={onCloseModalSuccess}
          >
            Done
          </Web3Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
