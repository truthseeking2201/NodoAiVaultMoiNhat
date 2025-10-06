import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PoolDetail, startCommunityMockTimers } from "@/features/community";
import { Button } from "@/components/ui/button";
import { getPathVaultCommunity } from "@/config/router";

const CommunityPoolDetailPage = () => {
  const { vault_id, pool_id } = useParams<{ vault_id: string; pool_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    startCommunityMockTimers(queryClient);
  }, [queryClient]);

  if (!vault_id || !pool_id) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 space-y-4">
      <div>
        <Button
          variant="ghost"
          className="px-0 text-white/70 hover:text-white"
          onClick={() => navigate(getPathVaultCommunity(vault_id))}
        >
          Back to Community
        </Button>
      </div>
      <PoolDetail poolId={pool_id} vaultIdFallback={vault_id} />
    </div>
  );
};

export default CommunityPoolDetailPage;
