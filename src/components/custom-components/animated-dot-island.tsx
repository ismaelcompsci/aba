import { PropsWithChildren, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  ZoomOut,
} from "react-native-reanimated";

import { AnimatedFlex, FlexProps } from "../layout/flex";

type AnimatedDotIslandProps = FlexProps & {
  backgroundColor: string;
  dotColor: string;
  dotSize: number;
  expandedWidth: number;
  expandedHeight: number;
  borderColor: string;
  yLocation?: number;
};

export const AnimatedDotIsland = ({
  backgroundColor,
  dotColor,
  dotSize,
  expandedHeight,
  expandedWidth,
  borderColor,
  yLocation,
  children,
  ...rest
}: PropsWithChildren<AnimatedDotIslandProps>) => {
  const dimensions = useWindowDimensions();
  const y = useSharedValue(0);
  const width = useSharedValue(dotSize);
  const height = useSharedValue(dotSize);
  const scale = useSharedValue(1);

  useEffect(() => {
    y.value = withSpring(yLocation ?? 100);
    width.value = withDelay(500, withSpring(expandedWidth));
    height.value = withDelay(500, withSpring(expandedHeight));
  }, []);

  const style = useAnimatedStyle(
    () => ({
      backgroundColor: width.value !== dotSize ? backgroundColor : dotColor,
      left: dimensions.width / 2 - width.value + width.value / 2,
      borderColor: width.value !== dotSize ? backgroundColor : borderColor,
      transform: [{ scale: scale.value }],
    }),
    []
  );

  useEffect(() => {
    scale.value = withSequence(withSpring(1.05), withSpring(1));
  });

  return (
    <AnimatedFlex
      style={[
        {
          position: "absolute",
          backgroundColor: dotColor,
          borderRadius: 999,
          width: dotSize,
          height: dotSize,
          overflow: "hidden",
          borderColor: borderColor,
          borderWidth: 2,
          zIndex: 99999,
        },

        { bottom: y },
        { width, height },
        style,
      ]}
      exiting={ZoomOut}
      {...rest}
    >
      <AnimatedFlex
        style={{
          alignItems: "center",
          justifyContent: "center",
          height,
        }}
        fill
      >
        {children}
      </AnimatedFlex>
    </AnimatedFlex>
  );
};
