import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  amount: number;
  precision?: number;
  stripZero?: boolean;
}) => {
  let formatted = new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: precision,
  }).format(amount);

  if (stripZero) {
    formatted = formatted.replace(/\.?0+$/, "");
  }

  return formatted;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
