import { ReactNode } from "react";
import clsx from "clsx";

/**
 * Matches Manage Liquidity header:
 * - height: 48px
 * - bg: white/8
 * - bottom border: white/10
 * - rounded top corners (requires parent Card to have overflow-hidden)
 */
type CardHeaderBarProps = {
  title: string;
  right?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  titleId?: string;
};

export function CardHeaderBar({
  title,
  right,
  subtitle,
  className,
  titleId,
}: CardHeaderBarProps) {
  return (
    <div
      className={clsx(
        "flex h-12 items-center justify-between px-5",
        "bg-white/8 border-b border-white/10",
        className
      )}
    >
      <div className="min-w-0">
        <div
          id={titleId}
          className="truncate text-[15px] font-medium leading-none text-white/90"
        >
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 text-[11px] leading-none text-white/55">
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

type HeaderPillProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "warn";
};

/** Quiet pill for small header statuses (optional) */
export function HeaderPill({ children, tone = "neutral" }: HeaderPillProps) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        "border",
        tone === "success"
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          : tone === "warn"
            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
            : "border-white/20 bg-white/10 text-white/70"
      )}
    >
      {children}
    </span>
  );
}
