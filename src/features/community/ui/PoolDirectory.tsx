import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePools } from "../hooks/use-community";
import CreatePoolModal from "./CreatePoolModal";
import JoinPoolModal from "./JoinPoolModal";

const PoolCard = ({
  pool,
  onClick,
}: {
  pool: any;
  onClick: () => void;
}) => {
  const visibilityStyles =
    pool.visibility === "private"
      ? "bg-white/10 text-white/70"
      : "bg-green-increase/10 text-green-increase";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-white/30"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-white font-semibold text-base">{pool.name}</div>
        <Badge className={cn("text-[11px] px-2 py-0.5 capitalize", visibilityStyles)}>
          {pool.visibility}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/50">
        <span>{pool.activeMembers}/{pool.maxMembers} members</span>
        {pool.viewerRole && (
          <span className="text-white/70">You are {pool.viewerRole}</span>
        )}
      </div>
      <div className="mt-3 text-[11px] text-white/40">
        Created {new Date(pool.createdAt).toLocaleDateString()}
      </div>
    </button>
  );
};

type PoolDirectoryProps = {
  vaultId: string;
  vaultName: string;
  collateralIcon?: string;
};

const PoolDirectory = ({ vaultId, vaultName, collateralIcon }: PoolDirectoryProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "mine" | "public") || "mine";
  const [activeTab, setActiveTab] = useState<"mine" | "public">(initialTab);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const yourPoolsQuery = usePools(vaultId, "mine");
  const publicPoolsQuery = usePools(vaultId, "public");

  const currentQuery = activeTab === "mine" ? yourPoolsQuery : publicPoolsQuery;

  const handleTabChange = (value: string) => {
    const next = value === "public" ? "public" : "mine";
    setActiveTab(next);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", next);
    setSearchParams(nextParams, { replace: true });
  };

  const handleCreated = (poolId: string) => {
    setCreateOpen(false);
    navigate(`/vault/${vaultId}/community/${poolId}`);
  };

  const handleJoined = (poolId: string) => {
    setJoinOpen(false);
    navigate(`/vault/${vaultId}/community/${poolId}`);
  };

  const renderContent = () => {
    if (currentQuery.isLoading) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      );
    }

    if (currentQuery.isError) {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-sm text-red-200">
          {(currentQuery.error as Error)?.message || "Unable to load pools"}
        </div>
      );
    }

    const pools = currentQuery.data ?? [];
    if (!pools.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
          {activeTab === "mine"
            ? "You are not part of any pools yet. Create one or join with an invite."
            : "No public pools found for this vault yet."}
        </div>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {pools.map((pool) => (
          <PoolCard
            key={pool.poolId}
            pool={pool}
            onClick={() => navigate(`/vault/${vaultId}/community/${pool.poolId}`)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/80 text-sm uppercase tracking-wide">
            {collateralIcon && (
              <img src={collateralIcon} alt="" className="h-6 w-6 rounded-full" />
            )}
            <span>{vaultName}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Community Pools</h1>
          <p className="text-white/50 text-sm mt-1">
            Form squads, compare PnL, and invite teammates to share vault performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-white/20 text-white/80 hover:text-white hover:border-white/40"
            onClick={() => setJoinOpen(true)}
          >
            Join via Invite
          </Button>
          <Button
            className="bg-white text-black hover:bg-white/90"
            onClick={() => setCreateOpen(true)}
          >
            Create Pool
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="mine" className="text-sm">
            Your Pools
          </TabsTrigger>
          <TabsTrigger value="public" className="text-sm">
            Public Pools
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {renderContent()}

      <CreatePoolModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        vaultId={vaultId}
        onCreated={handleCreated}
      />
      <JoinPoolModal open={joinOpen} onOpenChange={setJoinOpen} onJoined={handleJoined} />
    </div>
  );
};

export default PoolDirectory;
