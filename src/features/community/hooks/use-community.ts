import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import {
  COMMUNITY_QUERY_KEYS,
} from "../keys";
import {
  createPool,
  listPools,
  getPoolDetail,
  newInvite,
  joinByInvite,
  leavePool,
  removeMember,
  transferOwnership,
  getScoreboard,
  manualScoreboardRefresh,
  CommunityError,
} from "../mock/mock-api";
import { CreatePoolPayload, ScoreboardQuery, ScoreRow } from "../types";

const useCommunityWallet = () => {
  const { address, isAuthenticated, openConnectWalletDialog } = useWallet();

  const requireWallet = () => {
    if (!address || !isAuthenticated) {
      openConnectWalletDialog();
      throw new CommunityError("unauthenticated", "Connect wallet to continue");
    }
    return address;
  };

  return {
    address,
    isAuthenticated,
    requireWallet,
  };
};

export const usePools = (
  vaultId: string,
  scope: "mine" | "public"
) => {
  const { address } = useCommunityWallet();
  return useQuery({
    queryKey: COMMUNITY_QUERY_KEYS.pools(vaultId, scope),
    queryFn: () => listPools(vaultId, scope, address),
    enabled: !!vaultId,
    staleTime: 30_000,
  });
};

export const usePoolDetail = (poolId: string) => {
  const { address } = useCommunityWallet();
  return useQuery({
    queryKey: COMMUNITY_QUERY_KEYS.pool(poolId),
    queryFn: () => getPoolDetail(poolId, address),
    enabled: !!poolId,
  });
};

export const useScoreboard = (poolId: string, query: ScoreboardQuery) => {
  const { address } = useCommunityWallet();
  return useQuery<{ rows: ScoreRow[] }>({
    queryKey: COMMUNITY_QUERY_KEYS.scoreboard(poolId, query),
    queryFn: () => getScoreboard(poolId, query, address),
    enabled: !!poolId,
    refetchInterval: 60_000,
  });
};

export const useCreatePool = () => {
  const queryClient = useQueryClient();
  const { requireWallet } = useCommunityWallet();
  return useMutation({
    mutationFn: async (payload: CreatePoolPayload) => {
      const wallet = requireWallet();
      return createPool(payload, wallet);
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.pools(payload.vaultId, "mine"),
      });
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.pools(payload.vaultId, "public"),
      });
    },
  });
};

export const useNewInvite = (poolId: string) => {
  const queryClient = useQueryClient();
  const { requireWallet } = useCommunityWallet();
  return useMutation({
    mutationFn: async (hours?: number) => {
      const wallet = requireWallet();
      return newInvite(poolId, hours, wallet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.pool(poolId),
      });
    },
  });
};

export const useJoinByInvite = () => {
  const queryClient = useQueryClient();
  const { requireWallet } = useCommunityWallet();
  return useMutation({
    mutationFn: async ({ inviteToken }: { inviteToken: string }) => {
      const wallet = requireWallet();
      return joinByInvite(inviteToken, wallet);
    },
    onSuccess: ({ poolId }) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "community";
        },
      });
      queryClient.invalidateQueries({ queryKey: COMMUNITY_QUERY_KEYS.pool(poolId) });
    },
  });
};

export const useLeavePool = (vaultId: string) => {
  const queryClient = useQueryClient();
  const { requireWallet } = useCommunityWallet();
  return useMutation({
    mutationFn: async (poolId: string) => {
      const wallet = requireWallet();
      return leavePool(poolId, wallet);
    },
    onSuccess: (_, poolId) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "community";
        },
      });
      queryClient.invalidateQueries({ queryKey: COMMUNITY_QUERY_KEYS.pool(poolId) });
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.pools(vaultId, "mine"),
      });
    },
  });
};

export const useRemoveMember = (poolId: string) => {
  const queryClient = useQueryClient();
  const { requireWallet } = useCommunityWallet();
  return useMutation({
    mutationFn: async (walletAddress: string) => {
      const wallet = requireWallet();
      return removeMember(poolId, walletAddress, wallet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_QUERY_KEYS.pool(poolId) });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === "community" &&
            key[1] === "scoreboard" &&
            key[2] === poolId
          );
        },
      });
    },
  });
};

export const useTransferOwnership = (poolId: string) => {
  const queryClient = useQueryClient();
  const { requireWallet } = useCommunityWallet();
  return useMutation({
    mutationFn: async (walletAddress: string) => {
      const wallet = requireWallet();
      return transferOwnership(poolId, walletAddress, wallet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_QUERY_KEYS.pool(poolId) });
    },
  });
};

export const useScoreboardRefresh = (poolId: string, query: ScoreboardQuery) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => manualScoreboardRefresh(poolId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.scoreboard(poolId, query),
      });
    },
  });
};
