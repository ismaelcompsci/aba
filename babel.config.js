module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  plugins.push("expo-router/babel");
  plugins.push([
    "@tamagui/babel-plugin",
    {
      components: ["tamagui"],
      config: "./tamagui.config.ts",
      logTimings: true,
      disableExtraction: process.env.NODE_ENV === "development",
      importsWhitelist: ["constants.js", "colors.js"],
      xperimentalFlattenThemesOnNative: true,
    },
  ]);

  plugins.push("react-native-reanimated/plugin");

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
