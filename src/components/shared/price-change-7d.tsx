import React from "react";
import { formatAmount } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceChange7dProps {
  priceChange: number;
  className?: string;
  showParentheses?: boolean;
  showPeriod?: boolean;
}

const PriceChange7d: React.FC<PriceChange7dProps> = ({
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
      {isPositive && "+"}
      <span
        className={cn(
          isPositive ? "text-[#64EBBC]" : "text-red-400"
        )}
      >
        {formattedChange}%
      </span>
      {showPeriod && " in 7d"}
      {showParentheses && ")"}
    </span>
  );
};

export default PriceChange7d;
