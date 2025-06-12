import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_DISCOVER,
  timeout: 60000,
});

// Add a request interceptor
http.interceptors.request.use(
  (config) => {
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
  (error) => {
    const err = (error.response && error.response.data) || error;
    if (error.response && error.response.status === 401) {
      return Promise.reject(err);
    }

    if (error.response && error.response.status) {
      err.status = error.response.status;
    }

    return Promise.reject(err);
  }
);
export default http;
