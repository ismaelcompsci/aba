global.Buffer = require("buffer").Buffer;

export const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const stringToBase64 = (m: string) => {
  return Buffer.from(m).toString("base64");
};
