import * as React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  outline: {
    buttonWrapper:
      "bg-gradient-to-r from-[#FFE8C9] via-[#F9F4E9] via-60% to-[#C9D4FF] inline-flex p-[1px] rounded-md",
    buttonOut: "bg-black w-full h-auto rounded-md",
    buttonInner:
      "flex items-center justify-center w-full h-[30px] rounded-md bg-black",
    buttonText: "gradient-3rd text-sm font-semibold",
  },
  outline2: {
    buttonWrapper:
      "bg-gradient-to-r from-[#00CCFF] to-[#00FF5E] inline-flex p-[1px] rounded-full",
    buttonOut: "w-full h-auto rounded-full",
    buttonInner:
      "flex items-center justify-center w-full h-auto rounded-full bg-black px-2 py-[1px]",
    buttonText:
      "text-you-gradient text-[11px] leading-[16px] font-bold font-sans",
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "outline" | "outline2";
  classButtonOut?: string;
  classButtonInner?: string;
  classButtonText?: string;
  classLoader?: string;
  loading?: boolean;
  hideContentOnLoading?: boolean;
}

const ButtonGradient = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      classButtonOut,
      classButtonInner,
      classButtonText,
      classLoader,
      loading = false,
      hideContentOnLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        className={cn(
          "disabled:opacity-50",
          buttonVariants[variant].buttonWrapper,
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        <span className={cn(buttonVariants[variant].buttonOut, classButtonOut)}>
          <span
            className={cn(
              "block",
              buttonVariants[variant].buttonInner,
              classButtonInner
            )}
          >
            <span
              className={cn(
                "",
                buttonVariants[variant].buttonText,
                classButtonText
              )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader
                    className={cn(
                      "text-white w-4 h-4 animate-spin",
                      classLoader
                    )}
                  />
                  {!hideContentOnLoading && children}
                </div>
              ) : (
                children
              )}
            </span>
          </span>
        </span>
      </button>
    );
  }
);
ButtonGradient.displayName = "Button";

export { ButtonGradient };
