import { DepositVaultConfig } from "@/types/vault-config.types";
import httpNodo from "@/utils/http-nodo";

const NODO_URL = import.meta.env.VITE_NODO_APP_URL;

export const getLatestWithdrawal = (sender_address) => {
  return httpNodo.get(`/execution/withdrawals/latest/${sender_address}`);
};

export const executionWithdrawal = (payload) => {
  return httpNodo.post(`/execution/withdrawals`, payload);
};

export const executionProfitData = (vault_id) => {
  return httpNodo.get(
    `execution/vaults/${vault_id}/profit-data?lock_data=true`
  );
};

export const getVaultConfig = (vault_address) => {
  return httpNodo.get(
    `${NODO_URL}/data-management/vaults/${vault_address}?type=simple`
  );
};

export const getVaultsActivities = (payload: any) => {
  const { page, limit, action_type } = payload;
  if (action_type !== "") {
    return httpNodo.get(
      `/execution/position-requests?page=${page}&limit=${limit}&action_type=${action_type}`
    );
  } else {
    return httpNodo.get(
      `/execution/position-requests?page=${page}&limit=${limit}`
    );
  }
};

export const getDepositVaults = (accountAddress?: string) => {
  let url = `${NODO_URL}/data-management/vaults`;
  if (accountAddress && accountAddress !== "default") {
    url += `?wallet_address=${accountAddress}`;
  }
  return httpNodo.get(url) as Promise<DepositVaultConfig[]>;
};
