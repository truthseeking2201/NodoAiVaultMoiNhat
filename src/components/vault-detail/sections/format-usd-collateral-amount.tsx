import { cn } from "@/lib/utils";

const FormatUsdCollateralAmount = ({
  collateralIcon,
  text,
  className,
  collateralClassName,
}: {
  collateralIcon: string;
  text: any;
  className?: string;
  collateralClassName?: string;
}) => {
  if (!text)
    return collateralIcon === "USD" ? (
      "$--"
    ) : (
      <div className="flex items-center gap-1">
        <img
          src={`/coins/${collateralIcon?.toLowerCase()}.png`}
          alt={collateralIcon}
          className={cn("w-5 h-5 rounded-full", collateralClassName)}
        />
        --{" "}
      </div>
    );

  if (collateralIcon === "USD") {
    return <div className={className}>{`$${text}`}</div>;
  }
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <img
        src={`/coins/${collateralIcon?.toLowerCase()}.png`}
        alt={collateralIcon}
        className={cn("w-5 h-5 rounded-full", collateralClassName)}
      />{" "}
      {text}
    </div>
  );
};

export default FormatUsdCollateralAmount;
