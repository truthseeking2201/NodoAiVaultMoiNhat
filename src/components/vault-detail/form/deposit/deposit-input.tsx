import { FormattedNumberInput } from "@/components/ui/formatted-number-input-v2";
import { formatAmount } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import SelectTokens from "../select-tokens";
import { DepositForm } from "./deposit-form";
import BigNumber from "bignumber.js";
import { DepositToken } from "@/types/deposit-token.types";
import { SUI_CONFIG } from "@/config";
import { validateDepositBalance } from "./helpers";
import { ReactNode } from "react";

type DepositInputProps = {
  paymentTokens: DepositToken[];
  currentToken: DepositToken;
  depositAmountUsd: number;
  onTokenChange: (token: string) => void;
  readOnly?: boolean;
  footer?: ReactNode;
};

const DepositInput = ({
  paymentTokens,
  currentToken,
  depositAmountUsd,
  onTokenChange,
  readOnly = false,
  footer,
}: DepositInputProps) => {
  const { watch, setValue, control, clearErrors } =
    useFormContext<DepositForm>();
  const selectedToken = watch("token");
  const isSuitToken = currentToken?.token_address === SUI_CONFIG.coinType;

  const minDepositAmount = new BigNumber(1)
    .div(10 ** currentToken?.decimals)
    .toNumber();

  return (
    <>
      <Controller
      name="amount"
      control={control}
      rules={{
        required: {
          value: true,
          message: "Please enter an amount.",
        },
        pattern: {
          value: /^\d*\.?\d*$/,
          message: "Please enter a valid number",
        },
        min: {
          value: minDepositAmount,
          message: `Minimum deposit is ${minDepositAmount.toFixed(
            currentToken?.decimals
          )}`,
        },
        validate: (value) => validateDepositBalance(value, currentToken),
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormattedNumberInput
          value={value ? `${value}` : ""}
          amountAvailable={
            readOnly ? undefined : `${currentToken?.balance}`
          }
          maxDecimals={currentToken?.decimals}
          label="Deposit Amount"
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          maxBalanceAllowed={
            isSuitToken
              ? new BigNumber(currentToken?.balance)
                  .minus(SUI_CONFIG.gas_fee)
                  .abs()
                  .toString()
              : undefined
          }
          balanceInput={
            <div className="flex items-center space-x-2">
              <span className="text-white/80 text-sm font-medium font-sans">
                {currentToken
                  ? formatAmount({
                      amount: currentToken.balance,
                      precision: currentToken.decimals,
                    })
                  : "--"}{" "}
                {currentToken?.symbol}
              </span>
            </div>
          }
          balanceInputUsd={
            <span className="text-white/50 text-sm font-medium font-sans">
              {currentToken
                ? formatAmount({
                    amount: depositAmountUsd,
                    precision: 2,
                    minimumDisplay: 0.01,
                    sign: "$",
                  })
                : "$--"}{" "}
            </span>
          }
          rightInput={
            <SelectTokens
              selectedToken={selectedToken}
              tokens={paymentTokens}
              onSelectToken={(token) => {
                setValue("token", token);
                setValue("amount", "");
                clearErrors("amount");
                onTokenChange(token);
              }}
              title="Select Token"
            />
          }
        />
      )}
    />
      {footer && <div className="mt-3">{footer}</div>}
    </>
  );
};

export default DepositInput;
