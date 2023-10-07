import { Theme } from "../components/EpubReaderV2";

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

export const defaultTheme: Theme = {
  body: {
    background: "#fff",
    "padding-left": "15px !important",
    "padding-right": "15px !important",
    "padding-top": "64px !important",
    "padding-bottom": "32px !important",
  },
  span: {
    color: "#000 !important",
  },
  p: {
    color: "#000 !important",
    "font-size": "100%",
  },
  li: {
    color: "#000 !important",
  },
  h1: {
    color: "#000 !important",
  },
  a: {
    color: "#000 !important",
    "pointer-events": "auto",
    cursor: "pointer",
  },
  "::selection": {
    background: "lightskyblue",
  },
};

export const darkTheme: Theme = createThemeForBook({
  body: {
    color: "#dfe0e6",
    "padding-left": "15px !important",
    "padding-right": "15px !important",
    "padding-top": "64px !important",
    "padding-bottom": "32px !important",
    background: "#111",
  },
  span: {
    color: "#dfe0e6 !important",
  },
  p: {
    color: "#dfe0e6 !important",
  },
  li: {
    color: "#dfe0e6 !important",
  },
  h1: {
    color: "#dfe0e6 !important",
  },
  a: {
    color: "#dfe0e6 !important",
    "pointer-events": "auto",
    cursor: "pointer",
  },
});
