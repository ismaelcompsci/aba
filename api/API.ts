import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getItem } from "../utils/local-atoms";
import { GeneralSetting } from "../types/types";
import { ServerConfig } from "../components/login/login-form";

const BASE_URL = (
  JSON.parse(getItem(GeneralSetting.CurrentServerConfig) || "") as ServerConfig
).serverAddress;

const authInterceptor = (req: InternalAxiosRequestConfig) => {
  const serverConfig = JSON.parse(
    getItem(GeneralSetting.CurrentServerConfig) || ""
  ) as ServerConfig;

  if (serverConfig.token) {
    console.info("ADDED TOKEN");
    req.headers.Authorization = `Bearer ${serverConfig.token}`;
  }

  return req;
};

export const API = axios.create({
  baseURL: BASE_URL || "",
});

API.interceptors.request.use(authInterceptor, (error) => {
  // TODO bettter
  console.log("[AXIOS] ", error);
  return Promise.reject(error);
});

export const handleApiError = (error: AxiosError) => {
  try {
    const errorMessage = error?.response
      ? error?.response?.data || "An unexpected error has occurred."
      : "An unexpected error has occurred.";

    return { error: errorMessage, data: null };
  } catch (error) {
    throw new Error("An unexpected error occurred.");
  }
};
