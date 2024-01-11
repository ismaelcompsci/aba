/* eslint-disable simple-import-sort/imports */
import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { FadeInUp, FadeOutUp } from "react-native-reanimated";
import {
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUpDown,
  Fullscreen,
} from "@tamagui/lucide-icons";
import { useAtom, useSetAtom } from "jotai";

import {
  epubReaderMenuBlockSizeAtom,
  epubReaderMenuFontSizeAtom,
  epubReaderMenuGapAtom,
  epubReaderMenuInlineSizeAtom,
  epubReaderMenuLineHeightAtom,
  epubReaderMenuThemeAtom,
} from "../../../../state/epub-reader-state";
import { AnimatedFlex, Flex } from "../../../layout/flex";
import { TouchableArea } from "../../../touchable/touchable-area";
import { useReader } from "../../rn-epub-reader";
import { Button, Text } from "tamagui";
import { themes } from "../themes";

const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

export const EbookSettingsMenu = ({
  openSettings,
  hide,
  setOpenSettings,
}: {
  openSettings: boolean;
  hide: boolean;
  setOpenSettings: (open: boolean) => void;
}) => {
  const { width } = useWindowDimensions();
  const { isPdf } = useReader();
  const setEpubReaderMenuInlineSize = useSetAtom(epubReaderMenuInlineSizeAtom);

  useEffect(() => {
    setEpubReaderMenuInlineSize(width);
  }, [width]);

  useEffect(() => {
    if (!hide) {
      setOpenSettings(false);
    }
  }, [hide]);

  if (!openSettings) return null;

  return (
    <AnimatedFlex
      h={300}
      w={width}
      px={"$5"}
      space={"$2"}
      bg={"$background"}
      pos="absolute"
      top={104}
      pt="$4"
      entering={FadeInUp}
      exiting={FadeOutUp}
    >
      {/* theme & font size */}
      <Flex row justifyContent="space-between">
        <ThemeButtons />
        {!isPdf ? <FontSizeButtons /> : null}
      </Flex>
      {/* Scroll & gap  */}
      <Flex row justifyContent="space-between">
        <Flex row alignItems="center" space="$2">
          {/* {Platform.OS === "ios" && SCROLL_ENABLED ? (
            <>
              <Label paddingRight="$0" minWidth={90} justifyContent="flex-end">
                Scrolling View
              </Label>
              <Text fontSize={8}>(beta)</Text>
              <Separator minHeight={20} vertical pl={"$4"} />
              <Switch
                // defaultChecked={readerSettings.scrolled}
                onCheckedChange={onScrollViewChange}
              >
                <Switch.Thumb animation="quick" />
              </Switch>
            </>
          ) : null} */}
        </Flex>
        {!isPdf ? <GapButtons /> : null}
      </Flex>
      {/* line space */}
      {!isPdf ? (
        <Flex row justifyContent="space-between">
          <AudioPlayerModeButton />
          <LineHeightButtons />
        </Flex>
      ) : null}

      <Flex space></Flex>
    </AnimatedFlex>
  );
};

const LineHeightButtons = () => {
  const setLineHeight = useSetAtom(epubReaderMenuLineHeightAtom);

  const onLineSpaceChange = (step: number) => {
    setLineHeight((p) => Math.max(0, p + step));
  };

  return (
    <Flex row centered space={"$6"}>
      <TouchableArea
        hapticFeedback
        onPress={() => onLineSpaceChange(-LINESTEP)}
      >
        <ChevronsDownUp size={"$1"} />
      </TouchableArea>
      <TouchableArea hapticFeedback onPress={() => onLineSpaceChange(LINESTEP)}>
        <ChevronsUpDown size={"$1"} />
      </TouchableArea>
    </Flex>
  );
};

const AudioPlayerModeButton = () => {
  const { height } = useWindowDimensions();
  const [blockSize, setBlockSize] = useAtom(epubReaderMenuBlockSizeAtom);

  const size = height - 120 * 2 - 30;

  const onBlockSizeChange = () => {
    if (blockSize === size) {
      setBlockSize(height);
    } else {
      setBlockSize(size);
    }
  };

  const audioplayerMode = blockSize === size;
  return (
    <Flex row ai="center" space="$4">
      <Text>AudioPlayer mode</Text>
      <Button
        onPress={onBlockSizeChange}
        borderColor={audioplayerMode ? "$blue10" : undefined}
      >
        <Fullscreen />
      </Button>
    </Flex>
  );
};

const GapButtons = () => {
  const setGap = useSetAtom(epubReaderMenuGapAtom);

  const onGapChange = (step: number) => {
    setGap((p) => p + step);
  };

  return (
    <Flex row centered space={"$6"}>
      <TouchableArea hapticFeedback onPress={() => onGapChange(GAPSTEP)}>
        <ChevronsRightLeft size={"$1"} />
      </TouchableArea>
      <TouchableArea hapticFeedback onPress={() => onGapChange(-GAPSTEP)}>
        <ChevronsLeftRight size={"$1"} />
      </TouchableArea>
    </Flex>
  );
};

const ThemeButtons = () => {
  const [readerTheme, setReaderTheme] = useAtom(epubReaderMenuThemeAtom);

  const onThemeChange = (theme: {
    name: "dark" | "light" | "sepia";
    bg: string;
    fg: string;
  }) => {
    setReaderTheme(theme.name);
  };

  return (
    <Flex row gap="$4">
      {themes.map((theme) => (
        <Flex
          onPress={() => onThemeChange(theme)}
          key={theme.name}
          bg={theme.bg}
          borderColor={readerTheme === theme.name ? "$blue10" : "$gray11"}
          borderWidth={1}
          br={100}
          px={10}
          py={0}
          ai={"center"}
          jc={"center"}
        >
          <Text color={theme.fg}>Aa</Text>
        </Flex>
      ))}
    </Flex>
  );
};

const FontSizeButtons = () => {
  const setFontSize = useSetAtom(epubReaderMenuFontSizeAtom);

  const onFontSizeChange = (step: number) => {
    setFontSize((f) => Math.max(20, f + step));
  };

  return (
    <Flex row centered space={"$7"}>
      <TouchableArea
        hapticFeedback
        hitSlop={20}
        onPress={() => onFontSizeChange(-FONT_STEP)}
      >
        <Text fontSize={"$4"}>A</Text>
      </TouchableArea>
      <TouchableArea
        hapticFeedback
        hitSlop={20}
        onPress={() => onFontSizeChange(FONT_STEP)}
      >
        <Text fontSize={"$8"}>A</Text>
      </TouchableArea>
    </Flex>
  );
};
