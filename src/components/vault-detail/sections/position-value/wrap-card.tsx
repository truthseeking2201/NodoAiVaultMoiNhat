import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const WrapCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/10 p-4 w-full",
        className
      )}
    >
      {children}
    </div>
  );
};
