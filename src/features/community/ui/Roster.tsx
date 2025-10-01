import { PoolMember } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DecoratedMember = PoolMember & {
  alias: string;
};

type RosterProps = {
  members: DecoratedMember[];
  loading?: boolean;
  ownerWallet: string;
  viewerRole: "owner" | "member" | null;
  onRemove?: (wallet: string) => void;
  onTransferOwnership?: (wallet: string) => void;
  observerWallets?: Set<string>;
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleDateString();
};

const Roster = ({
  members,
  loading,
  ownerWallet,
  viewerRole,
  onRemove,
  onTransferOwnership,
  observerWallets,
}: RosterProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-12 bg-white/10 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="text-white font-semibold text-base">Roster</div>
        <p className="text-white/50 text-xs mt-1">
          Track roles, join dates, and observer status for everyone in this pool.
        </p>
      </div>
      {members.length === 0 ? (
        <div className="px-4 py-6 text-sm text-white/60 text-center">
          Nobody has joined this pool yet.
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {members.map((member) => {
            const isOwner = member.wallet === ownerWallet;
            const isObserver = observerWallets?.has(member.wallet);
            const statusLabel =
              member.status === "active"
                ? isOwner
                  ? "Owner"
                  : isObserver
                  ? "Observer"
                  : "Member"
                : member.status === "removed"
                ? "Removed"
                : "Left";
            return (
              <div
                key={`${member.poolId}-${member.wallet}`}
                className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">{member.alias}</div>
                  <div className="text-[11px] text-white/40">
                    {statusLabel} · Joined {formatDate(member.joinedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {viewerRole === "owner" && !isOwner && member.status === "active" && (
                    <>
                      {onTransferOwnership && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-white/70 hover:text-white"
                          onClick={() => onTransferOwnership(member.wallet)}
                        >
                          Transfer Ownership
                        </Button>
                      )}
                      {onRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-400 hover:text-red-300"
                          onClick={() => onRemove(member.wallet)}
                        >
                          Remove
                        </Button>
                      )}
                    </>
                  )}
                  {member.status !== "active" && (
                    <span
                      className={cn(
                        "text-[11px] px-2 py-1 rounded-full border",
                        member.status === "removed"
                          ? "border-red-500/40 text-red-300/80"
                          : "border-white/20 text-white/60"
                      )}
                    >
                      {statusLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Roster;
