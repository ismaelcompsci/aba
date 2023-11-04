// import { useEffect, useState } from "react";
// import {
//   Dimensions,
//   SafeAreaView,
//   StyleProp,
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from "react-native";
// import { PanGestureHandler } from "react-native-gesture-handler";
// import Animated, {
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   WithSpringConfig,
// } from "react-native-reanimated";
// import {
//   ChevronDown,
//   FastForward,
//   Play,
//   Rewind,
//   SkipBack,
//   SkipForward,
//   X,
// } from "@tamagui/lucide-icons";
// import {
//   H3,
//   H5,
//   H6,
//   Slider,
//   Stack,
//   Text,
//   useTheme,
//   XStack,
//   YStack,
// } from "tamagui";

import { Text } from "tamagui";

// import {
//   AudioPlayerInfo,
//   CirlceButton,
//   ProgressSlider,
//   SmallAudioPlayerWrapper,
// } from "../../components/audio-player/audio-player";
// import { FullScreen } from "../../components/center";
// import FastImage from "react-native-fast-image";
// import { BlurView } from "@react-native-community/blur";

// /**
//  * https://www.adapptor.com.au/blog/sliding-sheets
//  */

// interface SheetProps {
//   minHeight?: number;
//   maxHeight?: number;
//   expandedHeight?: number;
//   children?: React.ReactNode;
//   sheetStyles?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
//   navigationStyle?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
//   handle?: boolean;
//   icon: JSX.Element;
//   renderHeader: () => React.ReactNode;
// }

// type SheetPositions = "minimised" | "maximised" | "expanded";

// const window = Dimensions.get("window");
// const screen = Dimensions.get("screen");

// const NAV_HEIGHT = 48;

// const Sheet = (props: SheetProps) => {
//   const [dimensions, setDimensions] = useState({ window, screen });

//   useEffect(() => {
//     const listener = Dimensions.addEventListener(
//       "change",
//       ({ window, screen }) => {
//         setDimensions({ window, screen });
//       }
//     );

//     return () => listener?.remove();
//   }, []);

//   // Fixed values (for snap positions)
//   const minHeight = props.minHeight || 120;
//   const maxHeight = props.maxHeight || dimensions.screen.height;
//   const expandedHeight =
//     props.expandedHeight || dimensions.screen.height * 0.25;

//   const springConfig: WithSpringConfig = {
//     damping: 50,
//     mass: 0.3,
//     stiffness: 120,
//     overshootClamping: true,
//     restSpeedThreshold: 0.3,
//     restDisplacementThreshold: 0.3,
//   };

//   const position = useSharedValue<SheetPositions>("minimised");
//   const sheetHeight = useSharedValue(-minHeight);
//   const navHeight = useSharedValue(0);
//   const headerOpacity = useSharedValue(1);

//   const DRAG_BUFFER = 40;

//   const onGestureEvent = useAnimatedGestureHandler({
//     // Set the context value to the sheet's current height value
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     onStart: (_ev, ctx: any) => {
//       ctx.offsetY = sheetHeight.value;
//     },
//     // Update the sheet's height value based on the gesture
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     onActive: (ev, ctx: any) => {
//       sheetHeight.value = ctx.offsetY + ev.translationY;
//       if (-sheetHeight.value > minHeight + DRAG_BUFFER) {
//         headerOpacity.value = withSpring(0);
//       }

//       if (-sheetHeight.value < minHeight + DRAG_BUFFER) {
//         headerOpacity.value = withSpring(1);
//       }
//     },
//     // Snap the sheet to the correct position once the gesture ends
//     onEnd: () => {
//       ("worklet");
//       // Snap to minimised position if the sheet is dragged down from expanded position
//       const shouldMinimize =
//         position.value === "maximised" &&
//         -sheetHeight.value < dimensions.screen.height - DRAG_BUFFER;
//       // Snap to maximised position if the sheet is dragged up from expanded position
//       const shouldMaximize =
//         position.value === "minimised" &&
//         -sheetHeight.value > minHeight + DRAG_BUFFER;

//       if (shouldMaximize) {
//         navHeight.value = withSpring(NAV_HEIGHT + 10, springConfig);
//         sheetHeight.value = withSpring(-maxHeight, springConfig);
//         headerOpacity.value = withSpring(0, springConfig);

//         position.value = "maximised";
//       } else if (shouldMinimize) {
//         navHeight.value = withSpring(0, springConfig);
//         sheetHeight.value = withSpring(-minHeight, springConfig);
//         headerOpacity.value = withSpring(1, springConfig);
//         position.value = "minimised";
//       } else {
//         sheetHeight.value = withSpring(
//           position.value === "expanded"
//             ? -expandedHeight
//             : position.value === "maximised"
//             ? -maxHeight
//             : -minHeight,
//           springConfig
//         );
//       }
//     },
//   });

//   const sheetHeightAnimatedStyle = useAnimatedStyle(() => ({
//     height: -sheetHeight.value,
//   }));

//   const sheetContentAnimatedStyle = useAnimatedStyle(() => ({
//     paddingBottom: position.value === "maximised" ? 180 : 0,
//     paddingTop: position.value === "maximised" ? 40 : 20,
//   }));

//   const sheetNavigationAnimatedStyle = useAnimatedStyle(() => ({
//     height: navHeight.value,
//     overflow: "hidden",
//   }));

//   const headerAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: headerOpacity.value,
//   }));

//   const childrenAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: 1 - headerOpacity.value,
//   }));

//   return (
//     <View style={styles.container}>
//       <PanGestureHandler onGestureEvent={onGestureEvent}>
//         <Animated.View
//           style={[sheetHeightAnimatedStyle, styles.sheet, props.sheetStyles]}
//         >
//           {props.handle ? (
//             <View style={styles.handleContainer}>
//               <View style={styles.handle} />
//             </View>
//           ) : null}
//           <Animated.View style={[sheetContentAnimatedStyle]}>
//             <Animated.View
//               style={[sheetNavigationAnimatedStyle, props.navigationStyle]}
//             >
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => {
//                   navHeight.value = withSpring(0, springConfig);
//                   sheetHeight.value = withSpring(-minHeight, springConfig);
//                   headerOpacity.value = withSpring(1);
//                   position.value = "minimised";
//                 }}
//               >
//                 {props.icon ? props.icon : <Text>{`❌`}</Text>}
//               </TouchableOpacity>
//             </Animated.View>
//             <SafeAreaView>
//               <Animated.View style={[headerAnimatedStyle, { zIndex: 9999 }]}>
//                 {props.renderHeader()}
//               </Animated.View>
//               <View
//                 style={{
//                   position: "absolute",
//                   width: dimensions.window.width,
//                   height: dimensions.window.height,
//                 }}
//               >
//                 <Animated.View style={[childrenAnimatedStyle]}>
//                   {props.children}
//                 </Animated.View>
//               </View>
//             </SafeAreaView>
//           </Animated.View>
//         </Animated.View>
//       </PanGestureHandler>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // The sheet is positioned absolutely to sit at the bottom of the screen
//   container: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },
//   sheet: {
//     justifyContent: "flex-start",
//     backgroundColor: "#FFFFFF",
//     // Round the top corners
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     minHeight: 80,
//     // Add a shadow to the top of the sheet
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: -2,
//     },
//     shadowOpacity: 0.23,
//     shadowRadius: 2.62,
//     elevation: 4,
//   },
//   handleContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   handle: {
//     width: "15%",
//     height: 2,
//     borderRadius: 8,
//     backgroundColor: "#CCCCCC",
//   },
//   closeButton: {
//     width: NAV_HEIGHT,
//     height: NAV_HEIGHT,
//     borderRadius: NAV_HEIGHT,
//     alignItems: "center",
//     justifyContent: "center",
//     alignSelf: "flex-start",
//     marginBottom: 10,
//   },
// });

// const TestPage = () => {
//   const theme = useTheme();
//   const color = theme.color.get();
//   const bg = theme.backgroundPress.get();

//   const renderHeader = () => {
//     return (
//       <SmallAudioPlayerWrapper
//         bg={"$backgroundHover"}
//         mx={"$4"}
//         justifyContent="center"
//         style={{
//           shadowColor: "#000",
//           shadowOffset: {
//             width: 0,
//             height: 5,
//           },
//           shadowOpacity: 0.23,
//           shadowRadius: 2.62,
//         }}
//       >
//         <AudioPlayerInfo
//           audiobookInfo={{
//             author: "Brandon Sanderson",
//             cover:
//               "http://192.168.1.158:54932/api/items/ab91ea56-c8a4-4fd4-83c4-8e3ae8accefa/cover?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwidXNlcm5hbWUiOiJvd25lcl9pc21hZWwiLCJpYXQiOjE2NzA4MTU4MDB9.dNy1XejXAjvk_sKw2Zm-V_wM5LKQ5BgecTIk1Nt2rYs&ts=1698265454387",
//             title: "The final empire",
//           }}
//           playing={false}
//           color="white"
//         />
//         <ProgressSlider
//           color={color}
//           totalDuration={100}
//           overallCurrentTime={20}
//         />
//       </SmallAudioPlayerWrapper>
//     );
//   };

//   const imageWidth = window.width * 0.9;
//   const imageHeight = imageWidth;

//   return (
//     <FullScreen>
//       <XStack
//         flex={1}
//         bg={"$backgroundPress"}
//         justifyContent="center"
//         ai={"center"}
//       >
//         <Text>CONTENT</Text>
//       </XStack>
//       <Sheet
//         icon={<ChevronDown />}
//         navigationStyle={{ backgroundColor: bg }}
//         sheetStyles={{ backgroundColor: "transparent" }}
//         renderHeader={renderHeader}
//       >
//         <YStack
//           bg={"$backgroundPress"}
//           width={"100%"}
//           height={"100%"}
//           px={"$4"}
//         >
//           {/* IMAGE */}
//           <XStack width={"100%"} height={"50%"} jc={"center"} ai={"center"}>
//             <Stack>
//               <FastImage
//                 style={{
//                   width: imageWidth,
//                   height: imageHeight,
//                   borderRadius: 16,
//                 }}
//                 resizeMode="cover"
//                 source={{
//                   uri: "http://192.168.1.158:54932/api/items/ab91ea56-c8a4-4fd4-83c4-8e3ae8accefa/cover?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwidXNlcm5hbWUiOiJvd25lcl9pc21hZWwiLCJpYXQiOjE2NzA4MTU4MDB9.dNy1XejXAjvk_sKw2Zm-V_wM5LKQ5BgecTIk1Nt2rYs&ts=1698265454387",
//                 }}
//               />
//             </Stack>
//           </XStack>
//           {/* INFO */}
//           <YStack paddingTop={"$8"}>
//             <H3>The final empire</H3>
//             <H6>Brandon Sanderson</H6>
//           </YStack>
//           {/* PROGRESS */}
//           <YStack space={"$2"} pt={"$4"} width={"100%"}>
//             <Slider min={0} defaultValue={[0]} max={100} step={1} size={"$2"}>
//               <Slider.Track bg={"$backgroundHover"}>
//                 <Slider.TrackActive bg={"$backgroundStrong"} />
//               </Slider.Track>
//               <Slider.Thumb size="$1" index={0} circular elevate />
//             </Slider>
//             <XStack ai={"center"} jc={"space-between"}>
//               <Text fontSize={"$1"} color={"$gray10"}>
//                 00:00:00
//               </Text>
//               <Text fontSize={"$1"} color={"$gray10"}>
//                 00:00:00
//               </Text>
//             </XStack>
//           </YStack>
//           {/* CONTROLS */}
//           <XStack ai={"center"} width={"100%"} pt={"$4"}>
//             <CirlceButton>
//               <SkipBack />
//             </CirlceButton>
//             <XStack ai={"center"} justifyContent="center" flex={1} gap={"$3"}>
//               <CirlceButton h={"$6"} w={"$6"}>
//                 <Rewind size="$3" fill={color} />
//               </CirlceButton>
//               <CirlceButton bg={"$backgroundStrong"} h={"$7"} w={"$7"}>
//                 <Play size="$3" fill={color} />
//               </CirlceButton>
//               <CirlceButton h={"$6"} w={"$6"}>
//                 <FastForward size="$3" fill={color} />
//               </CirlceButton>
//             </XStack>
//             <CirlceButton>
//               <SkipForward />
//             </CirlceButton>
//           </XStack>
//           {/* ACTIONS */}
//         </YStack>
//       </Sheet>
//     </FullScreen>
//   );
// };

// export default TestPage;

const TestPage = () => {
  return <Text>Text</Text>;
};

export default TestPage;
