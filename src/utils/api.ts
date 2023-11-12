import axios from "axios";
import * as Burnt from "burnt";

import {
  LibraryItem,
  LibraryItemExpanded,
  LibraryItemMinified,
} from "../types/aba";
import { ServerConfig } from "../types/types";

export const pingServer = async (
  baseUrl: string
): Promise<{ success: boolean; title?: string; message?: string }> => {
  try {
    const response = await axios.get(`${baseUrl}/ping`, { timeout: 4000 });
    return { success: response.data.success };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Server ping failed", error);

      const errorMessage = {
        success: false,
        title: error.message || "",
        message: "Failed to ping server",
      };
      return errorMessage;
    }
    return {
      success: false,
      title: "Server Error",
      message: "Failed to ping server",
    };
  }
};

export const authenticateToken = async (config: ServerConfig) => {
  try {
    const response = await axios.post(
      `${config.serverAddress}/api/authorize`,
      null,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    console.error("[SERVER] server auth failed", error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response
        ? error.response.data || "Unknown Error"
        : "Unknown Error";

      Burnt.toast({
        title: "Authentication Failed",
        message: errorMsg,
        preset: "error",
      });
    }

    return;
  }
};

export const getItemCoverSrc = (
  libraryItem:
    | LibraryItemExpanded
    | LibraryItemMinified
    | LibraryItem
    | undefined
    | null,
  config: ServerConfig | null,
  token?: string,
  address?: string
) => {
  if (!libraryItem || !token) return;

  const media = libraryItem.media;
  if (!media || !media.coverPath) return null;

  const url = new URL(
    `/api/items/${libraryItem.id}/cover`,
    config?.serverAddress ?? address
  );

  return `${url}?token=${token}`;
};
