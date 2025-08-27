import React from "react";
import { cn } from "@/lib/utils";
import { formatDate12Hours } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "./skeleton";

export const RowSkeleton = () => (
  <div className="flex justify-between items-start">
    <Skeleton className="w-1/3 h-6" />
    <Skeleton className="w-1/3 h-6" />
  </div>
);

export const RowType = ({
  type,
  className,
  icon,
}: {
  type: string;
  className?: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2 w-full">
    <div className="text-xs text-white/80">Type</div>
    <div
      className={cn(
        "text-xs px-2 py-1 rounded-lg font-semibold ml-2",
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {type}
    </div>
  </div>
);

export const RowTime = ({
  timestamp,
  className,
}: {
  timestamp: string;
  className?: string;
  isLoading?: boolean;
  loadingClassName?: string;
  loadingLabelStyle?: string;
  loadingValueStyle?: string;
}) => {
  const time_tmp = formatDate12Hours(timestamp).split(" ");

  return (
    <div className={cn("flex justify-between items-center", className)}>
      <div className="text-xs text-white/80">Time</div>
      {time_tmp.length !== 0 ? (
        <div className="text-xs text-white/70 font-mono">
          {time_tmp[0]} {time_tmp[1]} {time_tmp[2]}
        </div>
      ) : (
        <div className="text-xs text-white/70 font-mono">--:--</div>
      )}
    </div>
  );
};

export const RowTokens = ({
  tokens,
}: {
  tokens: Array<{
    token_symbol: string;
    token_name: string;
    amount: number;
    decimal: number;
  }>;
}) => (
  <div className="flex justify-between items-start">
    <div className="text-xs text-white/80">Tokens</div>
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-start gap-1">
        <img
          src={`/coins/${tokens?.[0]?.token_symbol?.toLowerCase()}.png`}
          alt={tokens?.[0]?.token_name}
          className="w-[18px] h-[18px] inline-flex items-center"
        />
        <span className="font-mono text-xs text-white">
          {formatCurrency(tokens?.[0]?.amount || 0, tokens?.[0]?.decimal, 0, 4)}{" "}
          <span className="font-mono text-[10px] text-white/70">
            {tokens?.[0]?.token_symbol}
          </span>
        </span>
      </div>
      {tokens?.[1] && tokens?.[1]?.token_name && (
        <div className="flex items-center justify-start gap-1 mt-1">
          <img
            src={`/coins/${tokens?.[1]?.token_symbol?.toLowerCase()}.png`}
            alt={tokens?.[1]?.token_name}
            className="w-[18px] h-[18px] inline-flex items-center"
          />
          <span className="font-mono text-xs text-white">
            {formatCurrency(
              tokens?.[1]?.amount || 0,
              tokens?.[1]?.decimal,
              0,
              4
            )}{" "}
            <span className="font-mono text-[10px] text-white/70">
              {tokens?.[1]?.token_symbol}
            </span>
          </span>
        </div>
      )}
    </div>
  </div>
);

export const RowValue = ({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string | number;
  labelClassName?: string;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className={cn("text-xs text-white/80", labelClassName)}>{label}</span>
    <span className={cn("text-xs text-white", valueClassName)}>{value}</span>
  </div>
);

export const RowAction = ({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <div className="text-xs text-white/80">{label}</div>
    {children && children}
  </div>
);

const TableMobile = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
};

export default TableMobile;
