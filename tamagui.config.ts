import { config } from "@tamagui/config/v2-native";
import { tokens } from "@tamagui/themes/v2";
import { themes } from "@tamagui/themes/v2-themes";
import { createTamagui, createTokens } from "tamagui";

const custom_tokens = createTokens({
  ...tokens,
  color: {
    ...tokens.color,
    oled_background: "#050505",
    oled_foreground: "#d2d2d2",
  },
});

const oled = {
  background: custom_tokens.color.oled_background,
  color: custom_tokens.color.oled_foreground,
};

const appConfig = createTamagui({
  ...config,
  tokens: custom_tokens,
  themes: { ...themes, oled: { ...themes.dark, ...oled } },
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default appConfig;
