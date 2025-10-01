import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PoolDirectory, startCommunityMockTimers } from "@/features/community";
import { useVaultBasicDetails } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const CommunityDirectoryPage = () => {
  const { vault_id } = useParams<{ vault_id: string }>();
  const queryClient = useQueryClient();
  const safeVaultId = vault_id ?? "";
  const { data: vaultDetails, isLoading } = useVaultBasicDetails(safeVaultId);

  useEffect(() => {
    startCommunityMockTimers(queryClient);
  }, [queryClient]);

  if (!vault_id) {
    return <Navigate to="/" replace />;
  }

  const vaultName = vaultDetails?.vault_name || "Vault";
  const collateralSymbol = vaultDetails?.collateral_token_symbol;
  const collateralIcon = collateralSymbol
    ? `/coins/${collateralSymbol.toLowerCase()}.png`
    : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      {isLoading && !vaultDetails ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl bg-white/10" />
          <Skeleton className="h-40 w-full rounded-xl bg-white/10" />
        </div>
      ) : (
        <PoolDirectory
          vaultId={vault_id}
          vaultName={vaultName}
          collateralIcon={collateralIcon}
        />
      )}
    </div>
  );
};

export default CommunityDirectoryPage;
