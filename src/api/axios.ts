import axios from "axios";

export const FALLBACK_API_BASE_URL = "https://cape-backend-production.up.railway.app";

export function resolveApiBaseUrl(env: Record<string, string | undefined> = import.meta.env) {
  const configuredBaseUrl = env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl || configuredBaseUrl === "undefined" || configuredBaseUrl === "null") {
    return FALLBACK_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    if (!config || config.__apiRetry || !config.url || !status || ![404, 405].includes(status)) {
      return Promise.reject(error);
    }

    if (config.url.startsWith("/api/")) {
      return Promise.reject(error);
    }

    const retryConfig = {
      ...config,
      url: `/api${config.url.startsWith("/") ? config.url : `/${config.url}`}`,
      __apiRetry: true,
    };

    return api.request(retryConfig);
  },
);

export default api;