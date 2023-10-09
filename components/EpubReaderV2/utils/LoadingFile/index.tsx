import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { styles } from "./styles";
import { LoadingFileProps, ReaderProps } from "../../types";

export function LoadingFile({
  downloadProgress,
  width,
  height,
}: LoadingFileProps & Pick<ReaderProps, "width" | "height">) {
  return (
    <View style={[styles.container, { width, height }]}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>Loading {downloadProgress}%</Text>
    </View>
  );
}
