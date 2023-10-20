import { ThemeName } from "tamagui";

import { DeviceData } from "../types/types";

export type DefaultSettingsType = {
  theme: {
    scheme: "dark" | "light";
    color?: ThemeName | null | undefined;
    full?: string | null;
  };
  deviceData: DeviceData;
};

export const DefaultSettings: DefaultSettingsType = {
  theme: { scheme: "dark" },
  deviceData: {
    lastServerConnectionConfigId: null,
    serverConnectionConfigs: [],
  },
};
