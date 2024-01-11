import { useSharedValue } from "react-native-reanimated";
import { useAtomValue } from "jotai";
import { H6, Slider, Text } from "tamagui";

import { IS_ANDROID } from "../../../../constants/consts";
import { useAppSafeAreas } from "../../../../hooks/use-app-safe-areas";
import { epubReaderCurrentLocationAtom } from "../../../../state/epub-reader-state";
import { Flex } from "../../../layout/flex";
import { useReader } from "../../rn-epub-reader";

export const BottomMenu = () => {
  const left = useSharedValue(0);
  const epubReaderCurrentLocation = useAtomValue(epubReaderCurrentLocationAtom);

  const safeAreas = useAppSafeAreas();

  const { goToLocation } = useReader();

  const onValueChange = (value: number[]) => {
    goToLocation(value[0]);
  };

  const totalPages = parseInt(epubReaderCurrentLocation?.section?.total || "0");
  const currentPage = parseInt(
    epubReaderCurrentLocation?.section?.current || "0"
  );

  const pagesLeft = totalPages - currentPage;

  const page =
    pagesLeft === 1
      ? "1 page left"
      : pagesLeft === 0
      ? "Last page"
      : `${pagesLeft} pages left`;

  return (
    <Flex
      width="100%"
      height="100%"
      pb={safeAreas.bottom + (IS_ANDROID ? 10 : 0)}
    >
      <Slider
        id="SLIDER_MENU"
        name="SLIDER-MENU"
        flexGrow={1}
        size="$1"
        value={[
          epubReaderCurrentLocation?.fraction
            ? epubReaderCurrentLocation?.fraction
            : 0,
        ]}
        max={1}
        step={0.01}
        onValueChange={onValueChange}
        onSlideMove={(event) => {
          left.value = event.nativeEvent.pageX;
        }}
        themeInverse
      >
        <Slider.Track
          id="SLIDER_MENU-TRACK"
          $theme-oled={{
            bg: "$gray10",
          }}
        >
          <Slider.TrackActive
            id="SLIDER_MENU-1"
            $theme-oled={{
              bg: "$gray5",
            }}
          />
        </Slider.Track>
        <Slider.Thumb size={"$0.75"} index={0} circular elevate />
      </Slider>
      <Flex jc="space-between" row shrink alignItems="center" flexWrap="nowrap">
        <H6
          fontSize={"$2"}
          $gtSm={{ maxHeight: "80%" }}
          maxWidth={"60%"}
          numberOfLines={1}
        >
          {epubReaderCurrentLocation?.tocItem?.label}
        </H6>
        <Flex gap="$3" row>
          <Text fontSize={"$1"} numberOfLines={1}>
            {page}
          </Text>
          <Text fontSize={"$1"} fontWeight={"bold"} numberOfLines={1}>
            {((epubReaderCurrentLocation?.fraction || 0) * 100).toFixed(0)}%
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
