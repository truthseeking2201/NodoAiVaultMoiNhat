import { ChangeEvent, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Wallet2 } from "lucide-react";
import BigNumber from "bignumber.js";

const QUICK_AMOUNTS = [
  {
    label: "HALF",
    value: 0.5,
  },
  {
    label: "MAX",
    value: 1,
  },
];

const DEFAULT_MAX_AMOUNT = 1000000000;

interface FormattedNumberInputProps {
  value: string;
  placeholder?: string;
  className?: string;
  maxDecimals?: number;
  amountAvailable?: string;
  rightInput?: React.ReactNode;
  balanceInput?: React.ReactNode;
  disabled?: boolean;
  maxAmount?: number;
  onChange: (value: string) => void;
  onValidate?: (value: string) => void;
  onBlur?: (value: string) => void;
}

export function FormattedNumberInput({
  value,
  placeholder = "0.00",
  className = "",
  amountAvailable = "",
  maxDecimals = 6,
  rightInput = "",
  balanceInput = "",
  onChange,
  onValidate,
  onBlur,
  maxAmount = DEFAULT_MAX_AMOUNT,
  ...props
}: FormattedNumberInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
      // Only allow numbers and one decimal point
      if (!regex.test(inputValue) && inputValue !== "") {
        return;
      }

      if (inputValue && Number(inputValue) > maxAmount) {
        return;
      }

      onChange(inputValue);
      onValidate?.(inputValue);
    },
    [onChange, onValidate, maxDecimals, maxAmount]
  );

  const handleBlur = useCallback(() => {
    onBlur?.(value);
  }, [onBlur, value]);

  return (
    <div className={cn("p-4", "deposit_input_v2_wrapper", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 mr-2">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="font-mono hide-arrow h-[42px] text-[32px] font-bold bg-transparent text-white placeholder:text-white/60 w-full border-0 focus-visible:outline-none"
            {...props}
          />
        </div>
        {rightInput}
      </div>
      <div className="flex items-center space-x-2">
        {balanceInput && (
          <div className="flex items-center mr-1">
            <Wallet2 className="w-5 h-5 text-white opacity-50 mr-1.5" />
            {balanceInput}
          </div>
        )}
        {(amountAvailable ? QUICK_AMOUNTS : []).map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-center w-12 h-5 bg-black border border-white/25 rounded text-white text-xs font-bold opacity-80 hover:bg-white/10"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange(
                BigNumber(amountAvailable)
                  .multipliedBy(item.value)
                  .decimalPlaces(maxDecimals, BigNumber.ROUND_DOWN)
                  .toFixed()
              );
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
