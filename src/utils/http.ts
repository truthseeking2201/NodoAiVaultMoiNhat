import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { triggerWalletDisconnect } from "./wallet-disconnect";

const checkTokenAboutToExpired = (token: string) => {
  if (!token) return false;
  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000;
  return decoded?.exp < currentTime;
};

const handleRefreshTokenAboutToExpired = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return;
    let token = localStorage.getItem("access_token");
    if (checkTokenAboutToExpired(token)) {
      const refreshToken = localStorage.getItem("refresh_token");
      const res = await axios.post(`${baseURL}/data-management/auth/refresh`, {
        refresh_token: refreshToken,
      });
      if (res.status === 201 && res.data.data) {
        const { access_token, refresh_token } = res.data.data;
        token = access_token;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
      } else {
        triggerWalletDisconnect();
      }
    }
    return token;
  } catch (error) {
    return null;
  }
};

const baseURL = import.meta.env.VITE_NODO_APP_URL || "https://api-dev.nodo.xyz";

const http = axios.create({
  baseURL: baseURL,
  timeout: 60000,
});
// Request interceptor: add Authorization header if accessToken exists
http.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("access_token");

    const newToken = await handleRefreshTokenAboutToExpired();
    if (newToken) {
      token = newToken;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
http.interceptors.response.use(
  (response) => {
    // Return JSON data
    if (response.data) {
      return response.data.data != undefined
        ? response.data.data
        : response.data;
    }
    return response;
  },
  async (error) => {
    const err = (error.response && error.response.data) || error;
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post(
          `${baseURL}/data-management/auth/refresh`,
          { refresh_token: refreshToken }
        );
        if (res.status === 201 && res.data.data) {
          const { access_token, refresh_token } = res.data.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          // Update Authorization header and retry original request
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          }
        }

        return axios(originalRequest);
      } catch (refreshError) {
        if (refreshError.response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("current-address");
          triggerWalletDisconnect();
        }
        if (refreshError.response.status === 401) {
          return Promise.reject(
            "Your session has expired. Please login again."
          );
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status) {
      err.status = error.response.status;
    }

    return Promise.reject(err);
  }
);

export default http;
