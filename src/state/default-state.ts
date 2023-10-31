import { Dimensions } from "react-native";
import { ThemeName } from "tamagui";

import { Theme } from "../components/epub-reader/rn-epub-reader";
import { DeviceData } from "../types/types";

export type ThemeNames = ThemeName | "no color";

export type DefaultSettingsType = {
  theme: {
    scheme: "dark" | "light";
    color?: ThemeNames | null | undefined;
    full?: string | null;
  };
  deviceData: DeviceData;
  ebookSettings: Theme;
};

const w = Dimensions.get("window").width;

export const DefaultSettings: DefaultSettingsType = {
  theme: { scheme: "dark" },
  deviceData: {
    lastServerConnectionConfigId: null,
    serverConnectionConfigs: [],
  },
  ebookSettings: {
    lineHeight: 1.5,
    justify: true,
    hyphenate: true,
    gap: 0.06,
    maxInlineSize: w,
    maxBlockSize: 1440,
    maxColumnCount: 1,
    scrolled: false,
    fontSize: 100,
    theme: "dark",
  },
};
