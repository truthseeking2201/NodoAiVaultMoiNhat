import axios from "axios";
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
  const res = await axios.post(`${baseURL}${URLS.login}`, payload);
  return res.data?.data;
};
