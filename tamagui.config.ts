import { config } from "@tamagui/config";

import { Text, View } from "react-native";

import { createTamagui, setupReactNative } from "tamagui"; // or '@tamagui/core'
// if using only @tamagui/core with `react-native` components

// if using `tamagui` this isn't necessary as it does this setup for you (for most components)

setupReactNative({
  Text,
  View,
});

const appConfig = createTamagui(config);
export type AppConfig = typeof appConfig;
declare module "tamagui" {
  // or '@tamagui/core'

  // overrides TamaguiCustomConfig so your custom types

  // work everywhere you import `tamagui`

  interface TamaguiCustomConfig extends AppConfig {}
}
export default appConfig;
