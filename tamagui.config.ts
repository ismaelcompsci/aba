import { config, createGenericFont } from "@tamagui/config";
import { Text, View } from "react-native";

import {
  createFont,
  createTamagui,
  createTokens,
  setupReactNative,
} from "tamagui"; // or '@tamagui/core'
// if using only @tamagui/core with `react-native` components

// if using `tamagui` this isn't necessary as it does this setup for you (for most components)

setupReactNative({
  Text,
  View,
});
config.animations;
const appConfig = createTamagui({
  ...config,

  tokens: createTokens({
    ...config.tokens,
    size: { ...config.tokens.size, sm: 36, md: 46, lg: 60 },
    radius: {
      ...config.tokens.radius,
      sm: 4,
      md: 8,
      lg: 12,
    },
  }),
  fonts: {
    ...config.fonts,
    body: createFont({
      family: "Lato",
      weight: {
        ...config.fonts.body.weight,
      },
      size: {
        ...config.fonts.body.size,
      },
    }),
  },
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;

/* 
{
        weight: {
          1: "500",
        },
        size: {
          1: 11,
          2: 12,
          3: 13,
          4: 14,
          5: 16,
          6: 18,
          7: 20,
          8: 22,
          9: 30,
          10: 42,
          11: 52,
          12: 62,
          13: 72,
          14: 92,
          15: 114,
          16: 124,
        },
      },
      {
        sizeLineHeight: (x) => x * 1.5,
      }
*/
