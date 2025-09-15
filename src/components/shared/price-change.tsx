import React, { memo } from "react";
import { formatAmount } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceChangeProps {
  priceChange: number;
  className?: string;
  showParentheses?: boolean;
  showPeriod?: boolean;
}

const PriceChange: React.FC<PriceChangeProps> = ({
  priceChange,
  className,
  showParentheses = true,
  showPeriod = true,
}) => {
  const isPositive = priceChange > 0;
  const formattedChange = formatAmount({ amount: priceChange });
  
  return (
    <span className={cn("text-xs", className)}>
      {showParentheses && "("}
      <span
        className={cn(
          isPositive ? "text-green-increase" : "text-red-400"
        )}
      >
        {isPositive &&  "+"}
        {formattedChange}%
      </span>
      {showPeriod && " in 7d"}
      {showParentheses && ")"}
    </span>
  );
};

export default memo(PriceChange);
