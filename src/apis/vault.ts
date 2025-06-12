import http from "@/utils/http";
import httpNodo from "@/utils/httpNodo";

const URLS = {
  SAMPLE: "/api/v1/poll-user?limit=10&offset=0&order_by=-start_time",
};

const NODO_URL = import.meta.env.VITE_NODO_APP_URL;

export const getSample = () => {
  return http.get(URLS.SAMPLE);
};

export const getLatestWithdrawal = (sender_address) => {
  return httpNodo.get(`/execution/withdrawals/latest/${sender_address}`);
};

export const executionWithdrawal = (payload) => {
  return httpNodo.post(`/execution/withdrawals`, payload);
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

export const getDepositVaults = () => {
  return httpNodo.get(`${NODO_URL}/data-management/vaults`);
};
