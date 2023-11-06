/**
 * https://www.adapptor.com.au/blog/sliding-sheets
 */

import { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

interface SheetProps {
  minHeight?: number;
  maxHeight?: number;
  expandedHeight?: number;
  children?: React.ReactNode;
  sheetStyles?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  navigationStyle?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  handle?: boolean;
  icon?: JSX.Element;
  renderHeader: () => React.ReactNode;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  controlled: boolean;
}

type SheetPositions = "minimised" | "maximised" | "expanded";

const window = Dimensions.get("window");
const screen = Dimensions.get("screen");

const NAV_HEIGHT = 48;

const Sheet = ({
  minHeight,
  icon,
  renderHeader,
  children,
  expandedHeight,
  handle,
  maxHeight,
  navigationStyle,
  onOpenChange,
  open,
  sheetStyles,
  controlled,
}: SheetProps) => {
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
  const _minHeight = minHeight || 120;
  const _maxHeight = maxHeight || dimensions.screen.height;
  const _expandedHeight = expandedHeight || dimensions.screen.height * 0.25;

  const springConfig: WithSpringConfig = {
    damping: 50,
    mass: 0.3,
    stiffness: 120,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
  };

  const position = useSharedValue<SheetPositions>("minimised");
  const sheetHeight = useSharedValue(-_minHeight);
  const navHeight = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

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
      const height = ctx.offsetY + ev.translationY;
      sheetHeight.value = height;

      if (
        -sheetHeight.value > _minHeight + DRAG_BUFFER &&
        headerOpacity.value !== 0
      ) {
        headerOpacity.value = withSpring(0);
      }

      if (
        -sheetHeight.value < _minHeight + DRAG_BUFFER &&
        headerOpacity.value !== 1
      ) {
        headerOpacity.value = withSpring(1);
      }
    },
    // Snap the sheet to the correct position once the gesture ends
    onEnd: () => {
      ("worklet");
      // Snap to minimised position if the sheet is dragged down from expanded position
      const shouldMinimize =
        position.value === "maximised" &&
        -sheetHeight.value < dimensions.screen.height - DRAG_BUFFER;
      // Snap to maximised position if the sheet is dragged up from expanded position
      const shouldMaximize =
        position.value === "minimised" &&
        -sheetHeight.value > _minHeight + DRAG_BUFFER;

      if (shouldMaximize) {
        navHeight.value = NAV_HEIGHT + 10;
        sheetHeight.value = withSpring(-_maxHeight, springConfig);
        headerOpacity.value = withSpring(0, springConfig);
        position.value = "maximised";
        onOpenChange && runOnJS(onOpenChange)(true);
      } else if (shouldMinimize) {
        navHeight.value = withSpring(0, springConfig);
        sheetHeight.value = withSpring(-_minHeight, springConfig);
        headerOpacity.value = withSpring(1, springConfig);
        position.value = "minimised";
        onOpenChange && runOnJS(onOpenChange)(false);
      } else {
        if (position.value === "minimised" && headerOpacity.value !== 1) {
          headerOpacity.value = withSpring(1, springConfig);
        }
        sheetHeight.value = withSpring(
          position.value === "expanded"
            ? -_expandedHeight
            : position.value === "maximised"
            ? -_maxHeight
            : -_minHeight,
          springConfig
        );
      }
    },
  });

  const sheetHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: -sheetHeight.value,
  }));

  const sheetContentAnimatedStyle = useAnimatedStyle(() => ({
    // paddingBottom: position.value === "maximised" ? 180 : 0,
    // paddingTop: position.value === "maximised" ? 40 : 20,
  }));

  // const sheetNavigationAnimatedStyle = useAnimatedStyle(() => ({
  //   height: navHeight.value,
  //   overflow: "hidden",
  // }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    zIndex: position.value === "minimised" ? 9999 : 0,
  }));

  const childrenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - headerOpacity.value,
  }));

  useEffect(() => {
    if (open) {
      if (position.value === "maximised") return;
      navHeight.value = NAV_HEIGHT + 10;
      sheetHeight.value = withSpring(-_maxHeight, springConfig);
      headerOpacity.value = withSpring(0, springConfig);

      position.value = "maximised";
    } else {
      if (position.value === "minimised") return;
      navHeight.value = withSpring(0, springConfig);
      sheetHeight.value = withSpring(-_minHeight, springConfig);
      headerOpacity.value = withSpring(1);

      position.value = "minimised";
    }
  }, [open]);

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        hitSlop={{
          height: dimensions.window.height,
          top: dimensions.window.height / 2 - DRAG_BUFFER * 2,
        }}
      >
        <Animated.View
          style={[sheetHeightAnimatedStyle, styles.sheet, sheetStyles]}
        >
          {handle ? (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          ) : null}
          <Animated.View style={[sheetContentAnimatedStyle]}>
            <Animated.View
              style={[
                childrenAnimatedStyle,
                navigationStyle,
                { position: "absolute", zIndex: 9999, top: NAV_HEIGHT + 10 },
              ]}
            >
              {!controlled ? (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    navHeight.value = withSpring(0, springConfig);
                    sheetHeight.value = withSpring(-_minHeight, springConfig);
                    headerOpacity.value = withSpring(1);
                    // setMountHeader(true);
                    position.value = "minimised";
                  }}
                >
                  {icon ? icon : <Text>{`❌`}</Text>}
                </TouchableOpacity>
              ) : null}
            </Animated.View>
            <SafeAreaView>
              <Animated.View style={[headerAnimatedStyle]}>
                {renderHeader()}
              </Animated.View>
              <View
                style={{
                  position: "absolute",
                  width: dimensions.window.width,
                  height: dimensions.window.height,
                }}
              >
                <Animated.View style={[childrenAnimatedStyle]}>
                  {children}
                </Animated.View>
              </View>
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
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: -2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,
    // elevation: 4,
  },
  handleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: "15%",
    height: 2,
    borderRadius: 8,
    backgroundColor: "#CCCCCC",
  },
  closeButton: {
    paddingLeft: 18,
    // width: NAV_HEIGHT,
    // height: NAV_HEIGHT,
    // borderRadius: NAV_HEIGHT,
    // alignItems: "center",
    // justifyContent: "center"
    alignSelf: "flex-start",
    // marginBottom: 10,
  },
});

export default Sheet;
