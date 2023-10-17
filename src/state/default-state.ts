import { ThemeName } from "tamagui";

export type DefaultSettingsType = {
  theme: {
    scheme: "dark" | "light";
    gui?: ThemeName | null | undefined;
  };
};

export const DefaultSettings: DefaultSettingsType = {
  theme: { scheme: "dark", gui: null },
};
