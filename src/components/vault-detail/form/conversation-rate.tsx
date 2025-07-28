import ConditionRenderer from "@/components/shared/condition-renderer";
import { Button } from "@/components/ui/button";
import { RefreshCountdownIcon } from "@/components/ui/refresh-countdown-icon";
import { RowItem } from "@/components/ui/row-item";
import { showFormatNumber } from "@/lib/number";
import BigNumber from "bignumber.js";
import { ArrowRightLeft, Loader } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  sourceToken: {
    symbol: string;
    decimals?: number;
  };
  targetToken: {
    symbol: string;
    decimals?: number;
  };
  rate: number;
  isCalculating?: boolean;
  label?: string;
  onRefresh?: () => void;
};

const ConversationRate = ({
  sourceToken,
  targetToken,
  rate,
  onRefresh,
  isCalculating,
  label,
}: Props) => {
  const [isInverse, setIsInverse] = useState(false);

  const calculateRate = useMemo(() => {
    return isInverse ? new BigNumber(1).div(rate).toNumber() : rate;
  }, [isInverse, rate]);

  const sourceSymbol = isInverse ? targetToken.symbol : sourceToken.symbol;
  const targetSymbol = isInverse ? sourceToken.symbol : targetToken.symbol;

  return (
    <RowItem>
      <RowItem.Label>
        <span className="text-sm text-white/80">{label || "Rate"}</span>
      </RowItem.Label>
      <RowItem.Value>
        <div className="flex items-center">
          {onRefresh && (
            <ConditionRenderer when={!!rate}>
              <RefreshCountdownIcon
                onRefresh={onRefresh}
                key={sourceToken.symbol}
              />
            </ConditionRenderer>
          )}

          <div className="flex items-center text-sm mr-2 ml-2 tracking-tighter">
            {/* 1 {sourceSymbol} ={" "}
            {calculateRate ? showFormatNumber(calculateRate, 0, 4) : "--"}{" "}
            {targetSymbol} */}

            <span className="mr-1.5">1</span>
            {sourceSymbol}
            <span className="mx-1.5">=</span>
            {isCalculating ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : calculateRate ? (
              showFormatNumber(calculateRate, 0, targetToken.decimals || 4)
            ) : (
              "--"
            )}
            <span className="ml-1.5">{targetSymbol}</span>
          </div>
          <Button
            variant="icon"
            className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-white/10  text-gray-400 hover:text-gray-600 border border-white/20 !px-0"
            type="button"
            onClick={() => setIsInverse(!isInverse)}
          >
            <ArrowRightLeft className="!w-3 !h-3" />
          </Button>
        </div>
      </RowItem.Value>
    </RowItem>
  );
};

export default ConversationRate;
