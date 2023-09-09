import { ServerConfig } from "../components/login/login-form";
import { LibraryItem, LibraryItemMinified } from "../types/server";

export const getItemCoverSrc = (
  libraryItem: LibraryItemMinified | LibraryItem | undefined | null,
  token: string,
  config: ServerConfig
) => {
  if (!libraryItem || !token || !config) return;

  const media = libraryItem.media;
  if (!media || !media.coverPath) return null;

  const url = new URL(
    `/api/items/${libraryItem.id}/cover`,
    config.serverAddress
  );

  return `${url}?token=${token}`;
};

export const cleanString = (from: string | null | undefined, max: number) => {
  if (!from) return "";

  if (from.length > max) {
    return from.slice(0, max - 3) + "...";
  }
  return from;
};
