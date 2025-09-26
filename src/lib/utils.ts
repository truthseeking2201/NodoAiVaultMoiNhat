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
  minimumDisplay,
  sign,
}: {
  amount: number | string;
  precision?: number;
  stripZero?: boolean;
  minimumDisplay?: number;
  sign?: string;
}) => {
  let formatted = new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(new BigNumber(amount).toNumber());

  if (stripZero) {
    formatted = formatted.replace(/\.?0+$/, "");
  }

  if (sign) {
    formatted = sign + formatted;
  }

  if (amount && minimumDisplay && Number(amount) < minimumDisplay) {
    if (sign) {
      formatted = "<" + sign + minimumDisplay;
    } else {
      formatted = "<" + minimumDisplay;
    }
  }

  return formatted;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const roundDownBalance = (balance: number, decimal: number = 4) => {
  return Math.floor(balance * 10 ** decimal) / 10 ** decimal;
};

export const hexToBytes = (hex: string): number[] => {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;

  if (normalized.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i += 2) {
    const byte = parseInt(normalized.slice(i, i + 2), 16);

    if (Number.isNaN(byte)) {
      throw new Error("Invalid hex string provided");
    }

    bytes.push(byte);
  }

  return bytes;
};

export const formatPercentage = (value: number) => {
  return formatAmount({ amount: value, precision: 2, stripZero: false }) + "%";
};

export const getImage = (symbol: string) => {
  if (!symbol) return "";
  return `/coins/${symbol?.toLowerCase()}.png`;
};
