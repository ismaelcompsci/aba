import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Dimensions, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type PlayerBottomSheetProps = {
  initialHeight: number;
  HeaderComponent: React.ReactNode;
  ContentComponent: React.ReactNode;
};

export type PlayerBottomSheetRef = {
  expand: () => void;
  collapse: () => void;
};

export const PlayerBottomSheet = forwardRef<
  PlayerBottomSheetRef,
  PlayerBottomSheetProps
>(({ initialHeight, HeaderComponent, ContentComponent }, ref) => {
  const screen = useWindowDimensions();
  const [dimensions, setDimensions] = useState({ window: screen, screen });

  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const expand = () => {
    "worklet";
    translateY.value = withTiming(-dimensions.screen.height);
  };

  const collapse = () => {
    "worklet";
    translateY.value = withTiming(-initialHeight);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })

    .onChange((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.min(
        -initialHeight,
        Math.max(translateY.value, -dimensions.screen.height)
      );

      event.state;
    })
    .onEnd((event) => {
      const skip = event.velocityY > -100 && event.velocityY < 100;

      const isDirectionDown = context.value.y < translateY.value;
      const isDirectionUp = context.value.y > translateY.value;

      if (skip) {
        if (isDirectionDown) {
          expand();
        } else if (isDirectionUp) {
          collapse();
        }
        return;
      }

      if (isDirectionDown) {
        translateY.value = withTiming(-initialHeight);
      } else if (isDirectionUp) {
        expand();
      }
    });

  const bottomSheeetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  }, [dimensions]);

  const headerStyle = useAnimatedStyle(() => {
    const opacityValue = interpolate(
      translateY.value,
      [-initialHeight, -initialHeight * 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    const zIndex = interpolate(
      translateY.value,
      [-initialHeight, -initialHeight * 2],
      [9999, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: opacityValue,
      zIndex,
    };
  }, [dimensions]);

  const contentStyle = useAnimatedStyle(() => {
    const opacityValue = interpolate(
      translateY.value,
      [-initialHeight, -initialHeight * 2],
      [0, 1],
      Extrapolate.CLAMP
    );

    const borderRadius = interpolate(
      translateY.value,
      [-dimensions.screen.height + 60, -dimensions.screen.height],
      [24, 1],
      Extrapolate.CLAMP
    );

    return { opacity: opacityValue, borderRadius };
  }, [dimensions]);

  useEffect(() => {
    translateY.value = withSpring(-initialHeight, { damping: 16 });
  }, []);

  useEffect(() => {
    Dimensions.addEventListener("change", (e) => {
      setDimensions(e);
      translateY.value = -initialHeight;
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      expand,
      collapse,
    }),
    []
  );

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: dimensions.screen.width,
            height: dimensions.screen.height,
            backgroundColor: "transparent",
            top: dimensions.screen.height,
          },
          bottomSheeetStyle,
        ]}
      >
        {/* header */}
        <Animated.View
          style={[
            headerStyle,
            {
              position: "absolute",
              width: "100%",
              paddingHorizontal: 12,
            },
          ]}
        >
          {HeaderComponent}
        </Animated.View>

        {/* content */}
        <Animated.View
          style={[
            contentStyle,
            {
              flex: 1,
              zIndex: 100,
              overflow: "hidden",
            },
          ]}
        >
          {ContentComponent}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});
PlayerBottomSheet.displayName = "PlayerBottomSheet";
