import axios from "axios";
import { getToken, getUser } from "./auth";

const api = axios.create({
  baseURL: "https://vitalia.ddns.net/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const user = getUser();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.organizationId) {
      config.headers["x-organization-id"] = user.organizationId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
