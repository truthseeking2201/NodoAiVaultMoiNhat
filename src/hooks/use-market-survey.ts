import { useQuery } from "@tanstack/react-query";
import { getMarketSurveyOverview } from "@/apis";
import type { MarketSurveyOverview } from "@/types/market-survey";

const REFETCH_INTERVAL = 3 * 60 * 1000;

export const useMarketSurveyOverview = (vaultId?: string | null) => {
  return useQuery<MarketSurveyOverview, Error>({
    queryKey: ["market-survey-overview", vaultId],
    queryFn: () => getMarketSurveyOverview(vaultId as string),
    enabled: Boolean(vaultId),
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
    retry: 1,
  });
};
