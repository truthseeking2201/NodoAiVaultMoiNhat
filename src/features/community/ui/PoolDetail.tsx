import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  usePoolDetail,
  useScoreboard,
  useNewInvite,
  useLeavePool,
  useRemoveMember,
  useTransferOwnership,
  useScoreboardRefresh,
} from "../hooks/use-community";
import Scoreboard from "./Scoreboard";
import Roster, { DecoratedMember } from "./Roster";
import JoinPoolModal from "./JoinPoolModal";
import { ScoreboardQuery } from "../types";
import { logCommunityEvent } from "../mock/mock-analytics";
import { CommunityError } from "../mock/mock-api";

const validWindow = (value: string | null): ScoreboardQuery["window"] =>
  value === "30d" ? "30d" : "7d";
const validMetric = (value: string | null): ScoreboardQuery["metric"] =>
  value === "pnl_usd" ? "pnl_usd" : "pnl_pct";

type PoolDetailProps = {
  poolId: string;
  vaultIdFallback: string;
};

const PoolDetail = ({ poolId, vaultIdFallback }: PoolDetailProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("invite")) {
      setJoinOpen(true);
    }
  }, [searchParams]);

  const windowParam = validWindow(searchParams.get("window"));
  const metricParam = validMetric(searchParams.get("metric"));
  const [filters, setFilters] = useState<ScoreboardQuery>({
    window: windowParam,
    metric: metricParam,
  });

  useEffect(() => {
    setFilters({ window: windowParam, metric: metricParam });
  }, [windowParam, metricParam]);

  const detailQuery = usePoolDetail(poolId);

  const vaultId = detailQuery.data?.pool.vaultId ?? vaultIdFallback;
  const scoreboardQuery = useScoreboard(poolId, filters);
  const refreshScoreboard = useScoreboardRefresh(poolId, filters);
  const newInviteMutation = useNewInvite(poolId);
  const leaveMutation = useLeavePool(vaultId);
  const removeMutation = useRemoveMember(poolId);
  const transferMutation = useTransferOwnership(poolId);

  const observerWallets = useMemo(() => {
    const rows = scoreboardQuery.data?.rows ?? [];
    return new Set(rows.filter((row) => !row.eligible).map((row) => row.wallet));
  }, [scoreboardQuery.data]);

  const handleFilterChange = (next: ScoreboardQuery) => {
    setFilters(next);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("window", next.window);
    nextParams.set("metric", next.metric);
    setSearchParams(nextParams, { replace: true });
    logCommunityEvent({
      type: "community_scoreboard_filter_change",
      poolId,
      query: next,
    });
  };

  const handleInvite = async () => {
    try {
      const { inviteUrl } = await newInviteMutation.mutateAsync();
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      toast({
        title: "Invite link ready",
        description: "Link copied to clipboard. Share it with your crew.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to create invite",
        description: error?.message || "Try again later",
        variant: "error",
      });
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this pool?")) return;
    try {
      await leaveMutation.mutateAsync(poolId);
      toast({ title: "Left pool", description: "You can rejoin later with an invite." });
      navigate(`/vault/${vaultId}/community`);
    } catch (error: any) {
      toast({
        title: "Unable to leave",
        description: error?.message || "Transfer ownership before leaving.",
        variant: "error",
      });
    }
  };

  const handleRemoveMember = async (wallet: string) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await removeMutation.mutateAsync(wallet);
      toast({ title: "Member removed" });
    } catch (error: any) {
      toast({
        title: "Unable to remove member",
        description: error?.message || "Try again later",
        variant: "error",
      });
    }
  };

  const handleTransferOwnership = async (wallet: string) => {
    if (!window.confirm("Transfer pool ownership?")) return;
    try {
      await transferMutation.mutateAsync(wallet);
      toast({ title: "Ownership transferred" });
    } catch (error: any) {
      toast({
        title: "Transfer failed",
        description: error?.message || "Target must be an active member.",
        variant: "error",
      });
    }
  };

  const handleJoined = (nextPoolId: string) => {
    setJoinOpen(false);
    const params = new URLSearchParams(searchParams);
    params.delete("invite");
    setSearchParams(params, { replace: true });
    navigate(`/vault/${vaultId}/community/${nextPoolId}`, { replace: true });
  };

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl bg-white/10" />
        <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
        <Skeleton className="h-48 w-full rounded-xl bg-white/10" />
      </div>
    );
  }

  if (detailQuery.isError) {
    const error = detailQuery.error as CommunityError;
    if (error.code === "private_pool") {
      return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/70 space-y-3">
          <h2 className="text-xl font-semibold text-white">Private pool</h2>
          <p className="text-sm text-white/60">
            You need an invite token to access this community pool.
          </p>
          <Button
            className="bg-white text-black hover:bg-white/90"
            onClick={() => setJoinOpen(true)}
          >
            Enter invite token
          </Button>
          <JoinPoolModal open={joinOpen} onOpenChange={setJoinOpen} onJoined={handleJoined} />
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
        {error.message || "Unable to load pool"}
      </div>
    );
  }

  const { pool, members, isMember, viewerRole } = detailQuery.data!;
  const rows = scoreboardQuery.data?.rows ?? [];
  const decoratedMembers: DecoratedMember[] = members as DecoratedMember[];
  const scoreboardError = scoreboardQuery.isError
    ? ((scoreboardQuery.error as Error)?.message || "Unable to load scoreboard")
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>{pool.visibility === "private" ? "Private" : "Public"} pool</span>
              <span>·</span>
              <span>{pool.activeMembers}/{pool.maxMembers} members</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-white">{pool.name}</h1>
            <p className="text-white/50 text-sm mt-2">
              Owner {pool.ownerWallet.slice(0, 6)}…{pool.ownerWallet.slice(-4)} · Created {new Date(pool.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {viewerRole === "owner" && (
              <Button
                variant="outline"
                className="border-white/20 text-white/80 hover:text-white hover:border-white/40"
                onClick={handleInvite}
                disabled={newInviteMutation.isPending}
              >
                {newInviteMutation.isPending ? "Generating..." : "Invite"}
              </Button>
            )}
            {isMember && viewerRole !== "owner" && (
              <Button
                variant="outline"
                className="border-red-400/40 text-red-300 hover:text-red-200 hover:border-red-300"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
              >
                Leave
              </Button>
            )}
          </div>
        </div>
      </div>

      <Scoreboard
        rows={rows}
        loading={scoreboardQuery.isLoading}
        error={scoreboardError}
        query={filters}
        onQueryChange={handleFilterChange}
        onRefresh={() => refreshScoreboard.mutate()}
        refreshing={refreshScoreboard.isPending}
      />

      <Roster
        members={decoratedMembers}
        loading={detailQuery.isLoading}
        ownerWallet={pool.ownerWallet}
        viewerRole={viewerRole}
        observerWallets={observerWallets}
        onRemove={viewerRole === "owner" ? handleRemoveMember : undefined}
        onTransferOwnership={viewerRole === "owner" ? handleTransferOwnership : undefined}
      />

      <JoinPoolModal open={joinOpen} onOpenChange={setJoinOpen} onJoined={handleJoined} />
    </div>
  );
};

export default PoolDetail;
