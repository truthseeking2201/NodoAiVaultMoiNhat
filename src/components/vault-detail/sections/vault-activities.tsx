import { useCallback } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACTIVITIES_TABS } from "@/components/vault-detail/constant";
import { useState, useEffect } from "react";
import {
  TransactionHistory,
  Types,
  VaultActivityTransaction,
} from "@/types/vault";
import { getVaultsActivities } from "@/apis/vault";
import { useQuery } from "@tanstack/react-query";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  ITEMS_PER_PAGE,
  ADD_LIQUIDITY_TYPES,
  REMOVE_LIQUIDITY_TYPES,
  SWAP_TYPES,
} from "@/components/vault-detail/constant";
import MobileList from "@/components/vault-detail/activities/mobile";
import DesktopTable from "@/components/vault-detail/activities/desktop";

interface VaultActivitiesProps {
  isDetailLoading: boolean;
  vault_id: string;
}

const VaultActivities = ({
  isDetailLoading,
  vault_id,
}: VaultActivitiesProps) => {
  const [filter, setFilter] = useState<Types["type"][]>(["ALL"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastTotalPages, setLastTotalPages] = useState(1);

  const fetchVaultActivities = useCallback(
    async ({
      page = 1,
      limit = 5,
      action_type = "",
      vault_id = "",
    }: {
      page?: number;
      limit?: number;
      action_type?: string;
      vault_id?: string;
    }): Promise<TransactionHistory> => {
      try {
        const response = await getVaultsActivities({
          page,
          limit,
          action_type,
          vault_id,
        });

        if (response) {
          return response as TransactionHistory;
        }
      } catch (error) {
        console.error("Error fetching vault activities:", error);
      }
      return { list: [], total: 0, page: 1 } as TransactionHistory;
    },
    []
  );

  // Using React Query and set up pagination
  const { data, isFetching, isFetched } = useQuery({
    queryKey: ["activities", currentPage, filter],
    queryFn: () =>
      fetchVaultActivities({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        action_type: handleFormatFilter(filter),
        vault_id,
      }),
    staleTime: 30000,
  });

  const listItems = data?.list ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handleFormatFilter = useCallback((filter: Types["type"][]) => {
    if (filter.includes("ALL")) {
      return "";
    }
    if (filter.some((type) => SWAP_TYPES.includes(type))) {
      return "SWAP";
    }
    if (filter.some((type) => ADD_LIQUIDITY_TYPES.includes(type))) {
      return "ADD_LIQUIDITY";
    }
    if (filter.some((type) => REMOVE_LIQUIDITY_TYPES.includes(type))) {
      return "REMOVE_LIQUIDITY";
    }
    return "";
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [setCurrentPage, totalPages]
  );

  const handleFilterChange = useCallback(
    (newFilter: Types["type"][]) => {
      if (
        newFilter.length !== filter.length ||
        !newFilter.every((f, i) => f === filter[i])
      ) {
        setCurrentPage(1);
        setFilter(newFilter);
        fetchVaultActivities({
          page: 1,
          limit: ITEMS_PER_PAGE,
          action_type: handleFormatFilter(newFilter),
        });
      }
    },
    [fetchVaultActivities, handleFormatFilter, filter]
  );

  const handleSelectTransaction = useCallback(
    (transaction: VaultActivityTransaction) => {
      if (transaction.txhash) {
        window.open(
          `https://suiscan.xyz/mainnet/tx/${transaction.txhash}`,
          "_blank"
        );
      }
    },
    []
  );

  useEffect(() => {
    if (!isFetching && totalPages !== lastTotalPages) {
      setLastTotalPages(totalPages);
    }
  }, [isFetching, totalPages, lastTotalPages]);

  const displayTotalPages = isFetching ? lastTotalPages : totalPages;
  const paginatedTransactions = listItems;

  const { isMobile } = useBreakpoint();

  return (
    <DetailWrapper
      title="Vault Activities"
      titleComponent={
        <Tabs
          value={filter[0]}
          onValueChange={(value) =>
            handleFilterChange([value as Types["type"]])
          }
        >
          <TabsList className="p-1 flex gap-1">
            {ACTIVITIES_TABS.map((tab, index) => (
              <TabsTrigger key={`tab-${index}`} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      isLoading={isDetailLoading}
      loadingStyle="h-[447px] w-full"
    >
      {isMobile ? (
        <MobileList
          paginatedTransactions={paginatedTransactions}
          isFetched={isFetched}
          handleSelectTransaction={handleSelectTransaction}
          vault_id={vault_id}
        />
      ) : (
        <DesktopTable
          paginatedTransactions={paginatedTransactions}
          isFetching={isFetching}
          isFetched={isFetched}
          handleSelectTransaction={handleSelectTransaction}
          vault_id={vault_id}
        />
      )}

      <CustomPagination
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={totalItems}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        displayTotalPages={displayTotalPages}
        isShowingTotalPages={true}
      />
    </DetailWrapper>
  );
};

export default VaultActivities;
