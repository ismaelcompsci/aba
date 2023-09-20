import { Theme } from "../EpubReader";
import { ServerConfig } from "../components/login/login-form";
import { EbookFile, LibraryItem, LibraryItemMinified } from "../types/server";

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

export const ebookFormat = (ebookFile: EbookFile | undefined) => {
  if (!ebookFile) return null;

  if (!ebookFile.ebookFormat) {
    return ebookFile.metadata.ext.toLowerCase().slice(1);
  }
  return ebookFile.ebookFormat;
};

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
  /* https://stackoverflow.com/a/14919494/21758684 */

  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export const defaultTheme: Theme | any[] = {
  body: {
    "padding-left": "15px !important",
    "padding-right": "15px !important",
    // "padding-top": "32px !important",
  },
};

export const createThemeForBook = (newTheme: Theme) => {
  return createThemeForBookUtil(defaultTheme, newTheme);
};

export const createThemeForBookUtil = (defaultTheme: any, newTheme: any) => {
  let result = Array.isArray(newTheme)
    ? [...defaultTheme]
    : { ...defaultTheme };

  for (let key in newTheme) {
    if (
      typeof defaultTheme[key] === undefined ||
      typeof defaultTheme[key] !== "object"
    ) {
      result[key] = newTheme[key];
    }

    if (
      typeof defaultTheme[key] === "object" &&
      typeof newTheme[key] !== "object"
    ) {
      result[key] = newTheme[key];
    }

    if (
      typeof defaultTheme[key] === "object" &&
      typeof newTheme[key] === "object"
    ) {
      result[key] = createThemeForBookUtil(defaultTheme[key], newTheme[key]);
    }
  }

  return result;
};
