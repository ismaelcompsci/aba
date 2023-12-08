import { Dimensions } from "react-native";
import { ThemeName } from "tamagui";

import { Theme } from "../components/epub-reader/rn-epub-reader";
import { DeviceData } from "../types/types";

export type ThemeNames = ThemeName | "no color";

export type DefaultSettingsType = {
  theme: {
    scheme: "dark" | "light" | "oled";
    color?: ThemeNames | null | undefined;
    full?: string | null;
  };
  deviceData: DeviceData;
  ebookSettings: Theme;
};

const { width, height } = Dimensions.get("window");

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
    maxInlineSize: width,
    maxBlockSize: height,
    maxColumnCount: 1,
    scrolled: false,
    fontSize: 100,
    theme: "dark",
  },
};
