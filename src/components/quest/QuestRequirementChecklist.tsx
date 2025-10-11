import clsx from "clsx";
import { Check, X, Clock } from "lucide-react";

export function ChecklistItem({
  ok,
  label,
  sub,
}: {
  ok: boolean;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className={clsx(
          "mt-0.5 rounded-full p-0.5",
          ok ? "bg-emerald-500/15" : "bg-white/10"
        )}
      >
        {ok ? (
          <Check size={14} className="text-emerald-400" />
        ) : (
          <X size={14} className="text-white/50" />
        )}
      </div>
      <div>
        <div className="text-sm text-white/90">{label}</div>
        {sub && <div className="text-xs text-white/60">{sub}</div>}
      </div>
    </div>
  );
}

export function TimeProgress({
  ok,
  heldMs,
  requiredMs,
  started,
}: {
  ok: boolean;
  heldMs: number;
  requiredMs: number;
  started: boolean;
}) {
  if (!Number.isFinite(requiredMs) || requiredMs <= 0) {
    return null;
  }
  const clampedHeld = Math.max(0, Math.min(requiredMs, heldMs));
  const remainingMs = Math.max(0, requiredMs - heldMs);
  const percent = started
    ? Math.min(100, Math.floor((clampedHeld / requiredMs) * 100))
    : 0;
  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);
  const waitingCopy = "Timer will start once requirements are met.";
  const formattedTime = `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds
    .toString()
    .padStart(2, "0") }s`;
  const progressWidth = started
    ? `${Math.min(100, Math.max(percent, percent > 0 ? Math.max(percent, 0.5) : 0.5))}%`
    : "0%";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Clock size={14} />
        {ok
          ? "Completed"
          : started
            ? `Time remaining: ${formattedTime}`
            : waitingCopy}
      </div>
      <div className="h-2 rounded-full bg-white/8 border border-white/10">
        <div
          className="h-full rounded-full bg-emerald-400/80"
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  );
}
