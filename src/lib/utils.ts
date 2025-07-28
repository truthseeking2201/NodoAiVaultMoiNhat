import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import BigNumber from "bignumber.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const formatAmount = ({
  amount,
  precision = 2,
  stripZero = true,
}: {
  amount: number | string;
  precision?: number;
  stripZero?: boolean;
}) => {
  let formatted = new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(new BigNumber(amount).toNumber());

  if (stripZero) {
    formatted = formatted.replace(/\.?0+$/, "");
  }

  return formatted;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const roundDownBalance = (balance: number, decimal: number = 4) => {
  return Math.floor(balance * 10 ** decimal) / 10 ** decimal;
};

export const formatPercentage = (value: number) => {
  return formatAmount({ amount: value, precision: 2, stripZero: false }) + "%";
};
