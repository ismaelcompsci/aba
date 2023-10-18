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
