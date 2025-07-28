import { useState, useCallback, useMemo } from "react";
import { Check } from "lucide-react";
import Web3Button from "@/components/ui/web3-button";
import { RowItem } from "@/components/ui/row-item";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input-v2";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { IconCheckSuccess } from "@/components/ui/icon-check-success";
import Countdown, { zeroPad } from "react-countdown";
import AvgPaceIcon from "@/assets/images/avg-pace.png";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import ConversationRate from "../conversation-rate";

import { showFormatNumber } from "@/lib/number";
import { useToast } from "@/components/ui/use-toast";
import DataClaimType from "@/types/data-claim.types.d";
import { useWithdrawVault } from "@/hooks/use-withdraw-vault";

type Props = {
  data?: DataClaimType;
  balanceLp: string;
  onSuccess: () => void;
  reloadData: () => void;
};

const ClaimToken = ({ data, balanceLp, onSuccess, reloadData }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  /**
   * HOOKS
   */
  const { toast } = useToast();
  const { redeem } = useWithdrawVault();

  const rightInput = useMemo(() => {
    return (
      <div className="flex items-center">
        <img
          src={data?.withdrawSymbolImage}
          alt={data.withdrawSymbol}
          className="w-6 h-6 mr-2"
        />
        <span className="font-mono text-lg font-bold text-gray-200">
          {data.withdrawSymbol}
        </span>
      </div>
    );
  }, [data]);

  const balanceInput = useMemo(() => {
    return (
      <span className="text-white/80 text-sm font-medium font-sans">
        {showFormatNumber(balanceLp, 0, 6, "", true)} {data.withdrawSymbol}
      </span>
    );
  }, [balanceLp, data]);

  /**
   * FUNCTION
   */
  const onClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      await redeem(data.configLp);
      onSuccess();
      toast({
        title: "Withdraw successful!",
        description: `${showFormatNumber(data?.receiveAmount || 0)} ${
          data.receiveSymbol
        } has been Withdrawn to your account. Check your wallet for Tx details`,
        variant: "success",
        duration: 5000,
        icon: (
          <IconCheckSuccess
            size={14}
            className="h-6 w-6"
          />
        ),
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Claim failed",
        description: error?.message || error,
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
    }
    setIsLoading(false);
  }, [data, onSuccess, redeem, toast]);

  const renderer = ({ hours, minutes, seconds }) => {
    return (
      <div className="ml-2 flex items-center bg-amber-600/20 px-1 py-0.5 rounded-full">
        <img
          src={AvgPaceIcon}
          alt="AvgPaceIcon"
          className="w-4 h-4 mr-2"
        />
        <div className="text-amber-600 text-sm font-mono font-medium">
          {zeroPad(hours)}
          <span className="ai-hiden">:</span>
          {zeroPad(minutes)}
          <span className="ai-hiden">:</span>
          {zeroPad(seconds)}
        </div>
      </div>
    );
  };
  /**
   * LIFECYCLES
   */

  /**
   * RENDER
   */
  return (
    <div className="">
      <div className="font-body text-gray-400 !font-medium mb-2">
        Withdraw Amount
      </div>

      <FormattedNumberInput
        value={`${data.withdrawAmount}`}
        balanceInput={balanceInput}
        rightInput={rightInput}
        disabled={true}
        onChange={() => {}}
      />

      <div className="p-4 border border-white/15 rounded-[12px] rounded-t-none">
        <RowItem
          className="flex-col !justify-start !items-start"
          classNameValue="w-full mt-2 font-mono text-gray-200 font-bold"
        >
          <RowItem.Label>
            {!data.isClaim ? (
              <div className="flex items-center">
                <LabelWithTooltip
                  label="Est. Max Receive"
                  labelClassName="text-gray-200 font-bold text-base"
                  tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
                />
                <Countdown
                  date={data.timeUnlock}
                  renderer={renderer}
                  onComplete={reloadData}
                />
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-gray-200 font-bold text-base">
                  Actual Receive
                </span>
                <div className="ml-2 flex items-center bg-green-ready/20 p-1 rounded-full">
                  <div className="w-4 h-4 bg-green-ready rounded-full flex items-center justify-center">
                    <Check
                      className="text-black"
                      strokeWidth="4"
                      size={10}
                    />
                  </div>
                  <span className="text-green-ready text-xs font-mono font-bold ml-1">
                    READY
                  </span>
                </div>
              </div>
            )}
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
                {showFormatNumber(
                  data.receiveAmount,
                  0,
                  data.receiveDecimal || 6
                )}
              </DynamicFontText>
              <div className="flex items-center">
                <img
                  src={data?.receiveSymbolImage}
                  alt={data?.receiveSymbol}
                  className="w-6 h-6 mr-1"
                />
                <div className="text-lg">{data?.receiveSymbol}</div>
              </div>
            </div>
          </RowItem.Value>
        </RowItem>
        <hr className="w-full border-t border-white/15 my-2" />
        <ConversationRate
          sourceToken={{ symbol: data?.withdrawSymbol }}
          targetToken={{ symbol: data?.receiveSymbol }}
          rate={data.conversionRate}
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
        className="w-full font-semibold text-lg py-3 rounded-lg	flex items-center justify-center mt-4 mb-3"
        onClick={onClaim}
        disabled={isLoading || !data.isClaim}
        loading={isLoading}
      >
        {isLoading ? "Waiting" : "Claim"}
      </Web3Button>

      <p className="m-0 text-white/70 font-normal text-xs text-center">
        {data.isClaim
          ? "Your fund is now available for claiming. Please proceed to claim it before initiating a new one."
          : "Please wait to claim your previous withdrawal before initiating a new one"}
      </p>
    </div>
  );
};

export default ClaimToken;
