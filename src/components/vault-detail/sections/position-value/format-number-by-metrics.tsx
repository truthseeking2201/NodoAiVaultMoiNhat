import { cn } from "@/lib/utils";
import { showFormatNumber } from "@/lib/number";
import { useMemo } from "react";

export const FormatNumberByMetrics = ({
  unit,
  number = 0,
  className,
  collateralClassName = "w-4 h-4",
  indicator = false,
  maxPrecision = 6,
  minPrecision = 2,
  showUnit = false,
}: {
  unit: string;
  number: string | number;
  className?: string;
  collateralClassName?: string;
  indicator?: boolean;
  maxPrecision?: number;
  minPrecision?: number;
  showUnit?: boolean;
}) => {
  const isNegative = useMemo(() => {
    return Number(number) < 0;
  }, [number]);

  const numberAbs = useMemo(() => {
    return Math.abs(Number(number));
  }, [number]);

  const precision = useMemo(() => {
    return numberAbs < 1 ? maxPrecision : minPrecision;
  }, [numberAbs, maxPrecision, minPrecision]);

  const indicatorClass = useMemo(() => {
    if (indicator === true) {
      return isNegative ? "text-red-400" : "text-emerald-400";
    }
    return "";
  }, [indicator, isNegative]);

  const prefix = useMemo(() => {
    if (indicator === true) {
      return isNegative ? "-" : "+";
    }
    return isNegative ? "-" : "";
  }, [indicator, isNegative]);

  if (unit === "usd") {
    return (
      <span className={cn(className, indicatorClass)}>
        {prefix}
        {showFormatNumber(numberAbs, 2, precision, "$")}
      </span>
    );
  }
  if (showUnit) {
    return (
      <span className={cn(className, indicatorClass)}>
        {prefix}
        {showFormatNumber(numberAbs, 0, precision)}
        {unit}
      </span>
    );
  }
  return (
    <div className={cn("flex items-center gap-1", className, indicatorClass)}>
      {prefix}
      <img
        src={`/coins/${unit?.toLowerCase()}.png`}
        alt={unit}
        className={collateralClassName}
      />
      {showFormatNumber(numberAbs, 0, precision)}
    </div>
  );
};
