import axios from "axios";

let accessToken: string | null = null;
let baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function initApi(config: { baseURL: string }) {
  baseURL = config.baseURL;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
