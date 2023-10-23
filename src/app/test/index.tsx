import { StyleSheet } from "react-native";
import { View } from "tamagui";

const url =
  "http://192.168.1.159:54932/api/items/b5a64be0-31d8-4272-b72e-4554f535d2ef/cover?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwidXNlcm5hbWUiOiJvd25lcl9pc21hZWwiLCJpYXQiOjE2NzA4MTU4MDB9.dNy1XejXAjvk_sKw2Zm-V_wM5LKQ5BgecTIk1Nt2rYs";

const TestPage = () => {
  return <View></View>;
};
const Styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  navbar: {
    width: "100%",
    height: 50,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  separator: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "gray",
  },
  headerInfo: {
    height: 200,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  headerGenre: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    marginBottom: 5,
  },
  headerAuthor: {
    color: "white",
    marginBottom: 15,
  },
  headerDescription: {
    color: "white",
  },
  card: {
    height: 80,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(140,140,140,0.8)",
    paddingRight: 15,
    alignItems: "center",
  },
  cardImage: {
    height: 80,
    width: 80,
    backgroundColor: "white",
  },
  cardInfo: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cardTitle: {
    color: "black",
  },
});

export default TestPage;

// import React from "react";
// import { Animated, Dimensions, StyleSheet } from "react-native";
// import FastImage from "react-native-fast-image";
// import { Text, View, YStack } from "tamagui";

// const url =
//   "http://192.168.1.159:54932/api/items/b5a64be0-31d8-4272-b72e-4554f535d2ef/cover?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwidXNlcm5hbWUiOiJvd25lcl9pc21hZWwiLCJpYXQiOjE2NzA4MTU4MDB9.dNy1XejXAjvk_sKw2Zm-V_wM5LKQ5BgecTIk1Nt2rYs";

// export type ScrolledState = {
//   state: {
//     value: number;
//   };
// };

// interface ParallaxScrollProps {
//   scale?: number;
//   parallaxHeaderHeight: number;
//   stickyHeaderHeight: number;
//   parallaxHeader?: (value: Animated.Value) => React.ReactNode;
//   stickyHeader?: (value: Animated.Value) => React.ReactNode;
//   fixedHeader?: (value: Animated.Value) => React.ReactNode;
//   children: React.ReactNode;
// }

// class ParallaxScroll extends React.Component<ParallaxScrollProps> {
//   static defaultProps = {
//     scaleParallaxHeader: true,
//   };

//   _animatedValue = new Animated.Value(0);

//   constructor(props) {
//     super(props);

//     this._animatedValue.addListener(this.onScroll);
//   }

//   get stickyMarginTop() {
//     const { parallaxHeaderHeight = 0, stickyHeaderHeight = 0 } = this.props;
//     return Math.abs(parallaxHeaderHeight - stickyHeaderHeight);
//   }

//   onScroll = ({ value }) => {
//     const { onScroll, onSticky, stickyHeaderHeight } = this.props;

//     if (typeof onScroll === "function") {
//       onScroll(value);
//     }
//     if (typeof onSticky === "function") {
//       onSticky(value >= stickyHeaderHeight);
//     }
//   };

//   renderFixedHeader() {
//     const { fixedHeader } = this.props;

//     if (typeof fixedHeader !== "function") {
//       return null;
//     }

//     return (
//       <View
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//         }}
//       >
//         {fixedHeader(this._animatedValue)}
//       </View>
//     );
//   }

//   renderStickyHeader() {
//     const { stickyHeader, isSectionList } = this.props;

//     if (typeof stickyHeader !== "function") {
//       return null;
//     }

//     return stickyHeader(this._animatedValue);
//   }

//   renderParallaxHeader() {
//     const { parallaxHeader, scaleParallaxHeader, parallaxHeaderHeight } =
//       this.props;

//     if (typeof parallaxHeader !== "function") {
//       return null;
//     }

//     let animationStyle = null;
//     if (scaleParallaxHeader) {
//       const scaleValue = this.props.scale ?? 5;
//       console.log(scaleValue);
//       const scale = this._animatedValue.interpolate({
//         inputRange: [-parallaxHeaderHeight, 0],
//         outputRange: [scaleValue * 1.5, 1],
//         extrapolate: "clamp",
//       });
//       animationStyle = {
//         transform: [{ scale }],
//       };
//     }

//     return (
//       <Animated.View
//         style={[
//           {
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             width: "100%",
//           },
//           animationStyle,
//           { height: parallaxHeaderHeight },
//         ]}
//       >
//         {parallaxHeader(this._animatedValue)}
//       </Animated.View>
//     );
//   }

//   render() {
//     const { children, onRef, ...props } = this.props;

//     const event = Animated.event(
//       [
//         {
//           nativeEvent: {
//             contentOffset: {
//               y: this._animatedValue,
//             },
//           },
//         },
//       ],
//       { useNativeDriver: true }
//     );

//     return (
//       <View style={{ flex: 1 }}>
//         <Animated.ScrollView
//           style={{ flex: 1, overflow: "hidden" }}
//           ref={onRef}
//           onScroll={event}
//           stickyHeaderIndices={[2]}
//           {...props}
//         >
//           {this.renderParallaxHeader()}
//           <View style={{ height: this.stickyMarginTop }} />
//           {this.renderStickyHeader()}
//           {children}
//         </Animated.ScrollView>
//         {this.renderFixedHeader()}
//       </View>
//     );
//   }
// }

// const TestPage = () => {
//   const layout = Dimensions.get("window");
//   const IHeight = 250;
//   const HeaderHeight = 50;

//   const getPrallaxHeader = (_value: Animated.Value) => {
//     return (
//       <View
//         height={IHeight}
//         w={layout.width}
//         overflow="hidden"
//         alignItems="center"
//       >
//         <FastImage
//           style={{ width: layout.width, height: IHeight }}
//           resizeMode="cover"
//           source={{ uri: url }}
//         />
//       </View>
//     );
//   };

//   const getFixedHeader = (_value: Animated.Value) => {
//     return (
//       <View
//         style={{
//           height: 50,
//           width: "100%",
//           padding: 10,
//           justifyContent: "center",
//         }}
//       >
//         <Text style={{ color: "white" }}>Fixed Header</Text>
//       </View>
//     );
//   };

//   const getStickyHeader = (value: Animated.Value) => {
//     const opacity = value.interpolate({
//       inputRange: [0, 150, 200],
//       outputRange: [0, 0, 1],
//       extrapolate: "clamp",
//     });
//     return (
//       <View
//         style={{
//           height: 50,
//           width: "100%",
//           backgroundColor: "rgba(0,0,0,0.4)",
//         }}
//       >
//         <Animated.View
//           style={[
//             {
//               ...StyleSheet.absoluteFill,
//               backgroundColor: "purple",
//             },
//             { opacity },
//           ]}
//         />
//       </View>
//     );
//   };

//   return (
//     <YStack flex={1} bg="$background">
//       <ParallaxScroll
//         parallaxHeaderHeight={IHeight}
//         stickyHeaderHeight={HeaderHeight}
//         parallaxHeader={getPrallaxHeader}
//         fixedHeader={getFixedHeader}
//         stickyHeader={getStickyHeader}
//         scaleParallaxHeader
//         scale={2}
//       >
//         <View
//           style={{
//             width: "100%",
//             height: 10000,
//             padding: 20,
//             backgroundColor: "green",
//           }}
//         >
//           <Text>HEllo</Text>
//         </View>
//       </ParallaxScroll>
//     </YStack>
//   );
// };

// export default TestPage;
