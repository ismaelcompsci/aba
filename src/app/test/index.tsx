import { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Text, XStack, useTheme } from "tamagui";

import {
  AudioPlayerInfo,
  ProgressSlider,
  SmallAudioPlayerWrapper,
} from "../../components/audio-player/audio-player";
import { FullScreen } from "../../components/center";
import { X } from "@tamagui/lucide-icons";

/**
 * https://www.adapptor.com.au/blog/sliding-sheets
 */

interface SheetProps {
  minHeight?: number;
  maxHeight?: number;
  expandedHeight?: number;
  children?: React.ReactNode;
  sheetStyles?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

type SheetPositions = "minimised" | "maximised" | "expanded";

const window = Dimensions.get("window");
const screen = Dimensions.get("screen");

const NAV_HEIGHT = 48;

const Sheet = (props: SheetProps) => {
  const [dimensions, setDimensions] = useState({ window, screen });

  useEffect(() => {
    const listener = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );

    return () => listener?.remove();
  }, []);

  // Fixed values (for snap positions)
  const minHeight = props.minHeight || 120;
  const maxHeight = props.maxHeight || dimensions.screen.height;
  const expandedHeight =
    props.expandedHeight || dimensions.screen.height * 0.25;

  const springConfig: WithSpringConfig = {
    damping: 50,
    mass: 0.3,
    stiffness: 120,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
  };

  const position = useSharedValue<SheetPositions>("minimised");
  const sheetHeight = useSharedValue(-minHeight);
  const navHeight = useSharedValue(0);

  const DRAG_BUFFER = 40;

  const onGestureEvent = useAnimatedGestureHandler({
    // Set the context value to the sheet's current height value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onStart: (_ev, ctx: any) => {
      ctx.offsetY = sheetHeight.value;
    },
    // Update the sheet's height value based on the gesture
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onActive: (ev, ctx: any) => {
      sheetHeight.value = ctx.offsetY + ev.translationY;
    },
    // Snap the sheet to the correct position once the gesture ends
    onEnd: () => {
      ("worklet");
      // Snap to expanded position if the sheet is dragged up from minimised position
      // or dragged down from maximised position
      // const shouldExpand =
      //   (position.value === "maximised" &&
      //     -sheetHeight.value < maxHeight - DRAG_BUFFER) ||
      //   (position.value === "minimised" &&
      //     -sheetHeight.value > minHeight + DRAG_BUFFER);
      // Snap to minimised position if the sheet is dragged down from expanded position
      const shouldMinimize =
        position.value === "maximised" &&
        -sheetHeight.value <
          dimensions.screen.height - expandedHeight - DRAG_BUFFER;
      // Snap to maximised position if the sheet is dragged up from expanded position
      const shouldMaximize =
        position.value === "minimised" &&
        -sheetHeight.value > expandedHeight + DRAG_BUFFER;
      // Update the sheet's position with spring animation
      // if (shouldExpand) {
      //   navHeight.value = withSpring(0, springConfig);
      //   sheetHeight.value = withSpring(-expandedHeight, springConfig);
      //   position.value = "expanded";
      // } else
      if (shouldMaximize) {
        navHeight.value = withSpring(NAV_HEIGHT + 10, springConfig);
        sheetHeight.value = withSpring(-maxHeight, springConfig);
        position.value = "maximised";
      } else if (shouldMinimize) {
        navHeight.value = withSpring(0, springConfig);
        sheetHeight.value = withSpring(-minHeight, springConfig);
        position.value = "minimised";
      } else {
        sheetHeight.value = withSpring(
          position.value === "expanded"
            ? -expandedHeight
            : position.value === "maximised"
            ? -maxHeight
            : -minHeight,
          springConfig
        );
      }
    },
  });

  const sheetHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: -sheetHeight.value,
  }));

  const sheetContentAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: position.value === "maximised" ? 180 : 0,
    paddingTop: position.value === "maximised" ? 40 : 20,
    // paddingHorizontal: 10,
  }));

  const sheetNavigationAnimatedStyle = useAnimatedStyle(() => ({
    height: navHeight.value,
    overflow: "hidden",
  }));

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View
          style={[sheetHeightAnimatedStyle, styles.sheet, props.sheetStyles]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <Animated.View style={sheetContentAnimatedStyle}>
            <Animated.View style={sheetNavigationAnimatedStyle}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  navHeight.value = withSpring(0, springConfig);
                  sheetHeight.value = withSpring(-expandedHeight, springConfig);
                  position.value = "expanded";
                }}
              >
                {/* TDOD ADD PROPS FOR ICON */}
                <X />
              </TouchableOpacity>
            </Animated.View>
            <SafeAreaView>
              <View>{props.children}</View>
            </SafeAreaView>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  // The sheet is positioned absolutely to sit at the bottom of the screen
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    justifyContent: "flex-start",
    backgroundColor: "#FFFFFF",
    // Round the top corners
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 80,
    // Add a shadow to the top of the sheet
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  handleContainer: {
    alignItems: "center",
    justifyContent: "center",
    // paddingTop: 10,
  },
  handle: {
    width: "15%",
    height: 2,
    borderRadius: 8,
    backgroundColor: "#CCCCCC",
  },
  closeButton: {
    width: NAV_HEIGHT,
    height: NAV_HEIGHT,
    borderRadius: NAV_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
});

const TestPage = () => {
  const theme = useTheme();
  const color = theme.color.get();

  return (
    <FullScreen>
      <XStack
        height={"$15"}
        bg={"$backgroundHover"}
        justifyContent="center"
        ai={"center"}
      >
        <Text>CONTENT</Text>
      </XStack>
      <Sheet sheetStyles={{ backgroundColor: "transparent" }}>
        <SmallAudioPlayerWrapper>
          <AudioPlayerInfo
            audiobookInfo={{
              author: "Brandon Sanderson",
              cover: "",
              title: "The final empire",
            }}
            playing={false}
            color="white"
          />
          <ProgressSlider
            color={color}
            totalDuration={100}
            overallCurrentTime={20}
          />
        </SmallAudioPlayerWrapper>
      </Sheet>
    </FullScreen>
  );
};

export default TestPage;
