import { useRef, useState } from "react";
import Popover from "react-native-popover-view";
import { Slider, Text } from "tamagui";

import { VirtualizedList } from "../components/custom-components/virtual-scroll-view";
import { AnimatedFlex, Flex } from "../components/layout/flex";
import { Screen } from "../components/layout/screen";
import { Mode, Point } from "react-native-popover-view/dist/Types";
import { useSharedValue } from "react-native-reanimated";
import { View } from "react-native";

const testData = [
  2.220446049250313e-16, 0.0008461342308188965, 0.001428839373586925,
  0.003965134633338543, 0.005292817237113798, 0.0061052325446619895,
  0.011028195342152458, 0.011676230898757047, 0.06062346289127145,
  0.06125885385164961, 0.08644372838564354, 0.10695958576302785,
  0.14784061907943147, 0.18996187654237753, 0.19059726750275569,
  0.21902337353612478, 0.21965981821285513, 0.24053604658269273,
  0.27945927491670397, 0.29621441863307724, 0.32081974917335976,
  0.321419313777763, 0.352336405267739, 0.3795001591111694, 0.4287361093841873,
  0.45209594719616636, 0.47627979119556785, 0.47687935579997115,
  0.497320399316349, 0.5277980910874566, 0.5284366431968913, 0.5817030585170841,
  0.6092029478768671, 0.6410072685353977, 0.6781296956234947, 0.678729260227898,
  0.7179001119046768, 0.7388616912990428, 0.7701876247336734,
  0.7948719840003712, 0.8125986541934752, 0.8271441547192796,
  0.8511699412658508, 0.8743221969564459, 0.9058968074501963, 0.924271513199905,
  0.947937982470375, 0.9611926804647313, 0.9630493286773122, 0.9767550172704113,
  0.9795947828395972, 0.9863069560031277, 0.988337467413822, 0.9890698002786028,
  0.997189738488676, 1.0000000000000002,
];

const TestPage = () => {
  const sliderRef = useRef<View>(null);
  const left = useSharedValue(100);

  return (
    <Screen>
      <AnimatedFlex
        style={[
          { backgroundColor: "blue", height: 25, position: "absolute" },
          { left },
        ]}
      >
        <Text>Chapter 10 (1/10)</Text>
      </AnimatedFlex>
      <Flex style={{ paddingTop: 44, paddingHorizontal: 16 }}>
        <Flex pb="$10">
          <Slider
            ref={sliderRef}
            width="100%"
            size="$2"
            defaultValue={[50]}
            max={100}
            step={1}
            onSlideStart={() => {
              console.log("START");
            }}
            onSlideEnd={() => {
              console.log("END");
            }}
            onSlideMove={(e, v) => {
              left.value = e.nativeEvent.pageX;
            }}
            onPress={(e) => {}}
            onLayout={() => {
              console.log("SLIDER");
            }}
          >
            <Slider.Track>
              <Slider.TrackActive />
            </Slider.Track>
            <Slider.Thumb ref={sliderRef} index={0} circular elevate />
          </Slider>
        </Flex>
        {/* <Flex row width="100%">
          {testData.map((number, i) => {
            const prevPercent = testData[i - 1] * 100;
            const currentPercent = testData[i] * 100;
            const nextPercent = testData[i + 1] * 100;

            console.log(nextPercent - currentPercent);
            return (
              <>
                <Flex w={5} />
                <Flex
                  key={i}
                  width={
                    !isNaN(nextPercent - currentPercent)
                      ? nextPercent - currentPercent
                      : 0
                  }
                  h={10}
                  bg="white"
                />
                <Flex
                  w={`${
                    !isNaN(nextPercent - currentPercent)
                      ? nextPercent - currentPercent
                      : 0
                  }%
                  `}
                />
              </>
            );
          })}
        </Flex> */}
      </Flex>
    </Screen>
  );
};

export default TestPage;
