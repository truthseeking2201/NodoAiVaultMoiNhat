import { DepositVaultConfig } from "@/types/vault-config.types";
import http from "@/utils/http";

const URLS = {
  latestWithdrawal: `/data-management/external/withdrawals/latest`,
  executionWithdrawals: "/data-management/external/withdrawals",
  executionProfitData: (vault_id: string) =>
    `/data-management/external/vaults/${vault_id}/profit-data?lock_data=true`,
  withdrawalRequestsByUser:
    "/data-management/external/withdrawal-requests/by-user",
  vault: (vault_id: string) =>
    `/data-management/external/vaults/${vault_id}?type=simple`,
  positionRequests: (page: number, limit: number, action_type?: string) => {
    const baseUrl = `/data-management/external/position-requests?page=${page}&limit=${limit}`;
    return action_type && action_type !== ""
      ? `${baseUrl}&action_type=${action_type}`
      : baseUrl;
  },
  depositVaults: (accountAddress?: string) => {
    let url = `/data-management/external/vaults`;
    if (accountAddress && accountAddress !== "default") {
      url += `?wallet_address=${accountAddress}`;
    }
    return url;
  },
};

export const getLatestWithdrawal = () => {
  return http.get(URLS.latestWithdrawal);
};

export const executionWithdrawal = (payload: any) => {
  return http.post(URLS.executionWithdrawals, payload);
};

export const executionProfitData = (vault_id: string) => {
  return http.get(URLS.executionProfitData(vault_id));
};

export const getSignatureRedeem = (params: any) => {
  return http.get(URLS.withdrawalRequestsByUser, {
    params,
  });
};

export const getVault = (vault_id: string) => {
  return http.get(URLS.vault(vault_id)) as Promise<DepositVaultConfig>;
};

export const getVaultsActivities = (payload: any) => {
  const { page, limit, action_type } = payload;
  return http.get(URLS.positionRequests(page, limit, action_type));
};

export const getDepositVaults = (accountAddress?: string) => {
  return http.get(URLS.depositVaults(accountAddress)) as Promise<
    DepositVaultConfig[]
  >;
};
