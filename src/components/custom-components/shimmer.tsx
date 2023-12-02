/**
 * https://github.com/Uniswap/wallet/blob/main/packages/ui/src/loading/Shimmer.tsx#L22
 */
import { SetStateAction, useLayoutEffect, useState } from "react";
import { LayoutRectangle, StyleSheet } from "react-native";
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "tamagui/linear-gradient";

import { Flex } from "../layout/flex";

const SHIMMER_DURATION = 2000; // 2 seconds

type Props = {
  children: JSX.Element;
  contrast?: boolean;
};

// inspired by tutorial found here: https://github.com/kadikraman/skeleton-loader
export function Shimmer({ children, contrast }: Props): JSX.Element {
  const [layout, setLayout] = useState<LayoutRectangle | null>();
  const xPosition = useSharedValue(0);

  useLayoutEffect(() => {
    xPosition.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION }),
      Infinity,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          xPosition.value,
          [0, 1],
          [layout ? -layout.width : 0, layout ? layout.width : 0]
        ),
      },
    ],
  }));

  if (!layout) {
    return (
      <Flex
        opacity={0}
        onLayout={(event: {
          nativeEvent: {
            layout: SetStateAction<LayoutRectangle | null | undefined>;
          };
        }): void => setLayout(event.nativeEvent.layout)}
      >
        {children}
      </Flex>
    );
  }

  return (
    <MaskedView
      maskElement={children}
      style={{
        width: layout.width,
        height: layout.height,
      }}
    >
      <Flex
        grow
        backgroundColor={contrast ? "#7D7D7D" : "$backgroundPress"}
        overflow="hidden"
      />
      <Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <MaskedView
          maskElement={
            <LinearGradient
              fullscreen
              colors={["transparent", "black", "black", "black", "transparent"]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
            />
          }
          style={StyleSheet.absoluteFill}
        >
          <Flex backgroundColor="$surface2" style={StyleSheet.absoluteFill} />
        </MaskedView>
      </Reanimated.View>
    </MaskedView>
  );
}
