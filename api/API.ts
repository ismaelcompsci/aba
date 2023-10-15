import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getItem } from "../utils/local-atoms";
import { GeneralSetting } from "../types/types";
import { ServerConfig } from "../components/login/login-form";

const BASE_URL = (
  JSON.parse(
    getItem(GeneralSetting.CurrentServerConfig) || "{}"
  ) as ServerConfig
).serverAddress;

const authInterceptor = (req: InternalAxiosRequestConfig) => {
  const item = getItem(GeneralSetting.CurrentServerConfig) as ServerConfig;
  if (!item) {
    console.log("NO ITEM IN authInterceptor");
    return req;
  }

  let server;
  if (typeof item === "string") {
    server = JSON.parse(item);
  } else {
    server = item;
  }

  if (server.token) {
    req.headers.Authorization = `Bearer ${server.token}`;
  }

  return req;
};

export const API = axios.create({
  baseURL: BASE_URL || "",
});

API.interceptors.request.use(authInterceptor, (error) => {
  // TODO bettter
  console.log("[AXIOS] ", JSON.stringify(error));
  return Promise.reject(error);
});

export const handleApiError = (error: AxiosError) => {
  try {
    const errorMessage = error?.response
      ? error?.response?.data || "An unexpected error has occurred."
      : "An unexpected error has occurred.";

    console.log({ URL: error.config?.baseURL, errorMessage });
    return { error: errorMessage, data: null };
  } catch (error) {
    throw new Error("An unexpected error occurred.");
  }
};
