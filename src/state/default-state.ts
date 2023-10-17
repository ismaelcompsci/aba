import { ThemeName } from "tamagui";

import { DeviceData } from "../types/types";

export type DefaultSettingsType = {
  theme: {
    scheme: "dark" | "light";
    gui?: ThemeName | null | undefined;
  };
  deviceData: DeviceData;
};

export const DefaultSettings: DefaultSettingsType = {
  theme: { scheme: "dark", gui: null },
  deviceData: {
    lastServerConnectionConfigId: null,
    serverConnectionConfigs: [],
  },
};
