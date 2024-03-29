/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */
// @ts-ignore
import Path from "react-native-path";
import { formatDistance } from "date-fns";
import { ThemeName } from "tamagui";

import { EbookFile, User } from "../types/aba";

global.Buffer = require("buffer").Buffer;

export const colors: ThemeName[] = [
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
  "dark",
  "light",
];

export const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const stringToBase64 = (m: string) => {
  return Buffer.from(m).toString("base64");
};

export const prettyLog = (obj: unknown) => {
  console.log(JSON.stringify(obj, null, 2));
};

export const getRandomThemeColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

export const cleanString = (from: string | null | undefined, max: number) => {
  if (!from) return "";

  if (from.length > max) {
    return from.slice(0, max - 3) + "...";
  }
  return from;
};

export function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const getGradient = (color: string) => {
  switch (getColorType(color)) {
    case "hex":
      return [color, color + "33", color + "00"];
    case "hsl":
      // eslint-disable-next-line no-case-declarations
      const hslRegex = /hsl\(\s*(\d+)\s*,\s*([\d.]+%)\s*,\s*([\d.]+%)\s*\)/;
      // eslint-disable-next-line no-case-declarations
      const match = color.match(hslRegex);

      if (match) {
        const hue = parseInt(match[1]);
        const saturation = parseInt(match[2]);
        const lightness = parseInt(match[3]);

        const hex = hslToHex(hue, saturation, lightness);

        return [hex, hex + "33", hex + "00"].reverse();
      }
      break;
    default:
      break;
  }
};

const isHsl = (color: string) => {
  return color.startsWith("hsl");
};

const isHex = (color: string) => {
  return color.startsWith("#");
};

export const getColorType = (color: string): "hsl" | "hex" | "unknown" => {
  if (isHsl(color)) return "hsl";
  if (isHex(color)) return "hex";

  return "unknown";
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

export const ebookFormat = (ebookFile: EbookFile | undefined | null) => {
  if (!ebookFile) return null;

  if (!ebookFile.ebookFormat) {
    return ebookFile.metadata.ext.toLowerCase().slice(1);
  }
  return ebookFile.ebookFormat;
};

export const getUserMediaProgress = (
  user: User | null,
  libraryItemId: string
) => {
  if (!user?.mediaProgress || !libraryItemId) return;

  return user?.mediaProgress.find((md) => md.libraryItemId == libraryItemId);
};

export const encode = (text: string) =>
  encodeURIComponent(Buffer.from(text).toString("base64"));

export const decode = (text: string) =>
  Buffer.from(decodeURIComponent(text), "base64").toString();

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateUUID(digits: number) {
  const str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ";
  const uuid = [];
  for (let i = 0; i < digits; i++) {
    uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return uuid.join("");
}

export const formatSeconds = (time: number) =>
  new Date(time * 1000).toISOString().slice(11, 19);

export const dateDistanceFromNow = (timestamp: number) => {
  return formatDistance(timestamp, Date.now(), { addSuffix: true });
};

/**
 * https://github.com/advplyr/audiobookshelf-app/blob/f89148b92e3f8b2f2bc929f7b440d859eae3eb0d/plugins/init.client.js#L75
 */
export const elapsedTime = (seconds: number, useFullNames = false): string => {
  "worklet";
  if (seconds < 60) {
    return `${Math.floor(seconds)} sec${useFullNames ? "onds" : ""}`;
  }
  let minutes = Math.floor(seconds / 60);
  if (minutes < 70) {
    return `${minutes} min${
      useFullNames ? `ute${minutes === 1 ? "" : "s"}` : ""
    }`;
  }
  const hours = Math.floor(minutes / 60);
  minutes -= hours * 60;
  if (!minutes) {
    return `${hours} ${useFullNames ? "hours" : "hr"}`;
  }
  return `${hours} ${
    useFullNames ? `hour${hours === 1 ? "" : "s"}` : "hr"
  } ${minutes} ${useFullNames ? `minute${minutes === 1 ? "" : "s"}` : "min"}`;
};
export const elapsedMiniTime = (seconds: number): string => {
  "worklet";
  if (seconds < 60) {
    return `${Math.floor(seconds)} sec`;
  }
  let minutes = Math.floor(seconds / 60);
  if (minutes < 70) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  minutes -= hours * 60;
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

export const secondsToTimestamp = (seconds: number) => {
  let _seconds = seconds;
  let _minutes = Math.floor(seconds / 60);
  _seconds -= _minutes * 60;
  const _hours = Math.floor(_minutes / 60);
  _minutes -= _hours * 60;
  _seconds = Math.floor(_seconds);
  if (!_hours) {
    return `${_minutes}:${_seconds.toString().padStart(2, "0")}`;
  }
  return `${_hours}:${_minutes.toString().padStart(2, "0")}:${_seconds
    .toString()
    .padStart(2, "0")}`;
};

export function getObjectValue<T>(obj: T, path: string) {
  if (!path) return obj;
  const properties = path.split(".");
  if (properties)
    return getObjectValue(
      obj[properties.shift() as keyof T],
      properties.join(".")
    );
}

/**
 * https://github.com/advplyr/audiobookshelf-app/blob/737b6d7c26379e27afc759baecc145ec698f0419/plugins/init.client.js#L137
 */
export const sanitizeFilename = (input: string, colonReplacement = " - ") => {
  if (typeof input !== "string") {
    return false;
  }

  // Max is actually 255-260 for windows but this leaves padding incase ext wasnt put on yet
  const MAX_FILENAME_LEN = 240;

  const replacement = "";
  const illegalRe = /[\/\?<>\\:\*\|"]/g;
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  const windowsTrailingRe = /[\. ]+$/;
  const lineBreaks = /[\n\r]/g;

  let sanitized = input
    .replace(":", colonReplacement) // Replace first occurrence of a colon
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(lineBreaks, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);

  if (sanitized.length > MAX_FILENAME_LEN) {
    const lenToRemove = sanitized.length - MAX_FILENAME_LEN;
    const ext = Path.extname(sanitized);
    let basename = Path.basename(sanitized, ext);
    basename = basename.slice(0, basename.length - lenToRemove);
    sanitized = basename + ext;
  }

  return sanitized;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction<T extends any[]> = (...args: T) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends any[]>(
  callback: DebouncedFunction<T>,
  wait: number
) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T) => {
    clearTimeout(timeoutId!);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};
