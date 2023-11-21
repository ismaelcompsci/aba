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

        return [hex, hex + "33", hex + "00"];
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
