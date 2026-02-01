import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
} from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add Authorization header
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 -> refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { token: refreshToken }
        );

        setTokens(data.token, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        return api(originalRequest);
      } catch (err) {
        removeTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
