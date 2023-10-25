import { ThemeName } from "tamagui";

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

const getColorType = (color: string): "hsl" | "hex" | "unknown" => {
  if (isHsl(color)) return "hsl";
  if (isHex(color)) return "hex";

  return "unknown";
};
