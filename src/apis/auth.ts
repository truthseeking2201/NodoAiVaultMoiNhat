import axios from "axios";
import { isMockMode } from "@/config/mock";
import { mockAuthResponse } from "@/mocks";
const baseURL = import.meta.env.VITE_NODO_APP_URL || "https://api-dev.nodo.xyz";

const URLS = {
  login: "/data-management/auth/login",
  refreshToken: "/data-management/auth/refresh",
};

export const loginWallet = async (payload: {
  signature: string;
  timestamp: number;
  address: string;
}) => {
  if (isMockMode) {
    return { ...mockAuthResponse, wallet_address: payload.address };
  }
  const res = await axios.post(`${baseURL}${URLS.login}`, payload, {
    timeout: 10000,
  });
  return res.data?.data;
};
