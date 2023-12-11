import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";
import {
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUpDown,
  Fullscreen,
  List,
  Settings2,
} from "@tamagui/lucide-icons";
import { Stack } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { Button, H6, Text } from "tamagui";

import { themes } from "../../components/epub-reader/components/themes";
import {
  ReaderProvider,
  Theme,
  useReader,
} from "../../components/epub-reader/rn-epub-reader";
import { BackButton } from "../../components/layout/back-header";
import { AnimatedFlex, Flex } from "../../components/layout/flex";
import { TouchableArea } from "../../components/touchable/touchable-area";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import {
  epubReaderOverviewModalAtom,
  epubReaderShowMenuAtom,
} from "../../state/app-state";
import { ebookSettignsAtom } from "../../state/local-state";

const layout = () => {
  return (
    <ReaderProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Menu />
    </ReaderProvider>
  );
};

const Menu = () => {
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);
  const show = useAtomValue(epubReaderShowMenuAtom);
  const [openSettings, setOpenSettings] = useState(false);

  const { left, right, top } = useAppSafeAreas();
  const { width } = useWindowDimensions();

  if (!show) return null;

  return (
    <>
      <AnimatedFlex
        w={width}
        height={104}
        paddingLeft={left}
        paddingRight={right}
        bg={"$background"}
        pos={"absolute"}
        top={0}
        left={0}
        right={0}
        zIndex={9999}
        entering={FadeInUp}
        exiting={FadeOutUp}
        alignItems="center"
        pt={top}
      >
        <Flex
          row
          flex={1}
          alignItems="center"
          paddingHorizontal={"$4"}
          pos={"relative"}
        >
          <Flex row flex={1} gap="$4" ai={"center"}>
            <BackButton />
            <H6
              numberOfLines={1}
              $sm={{ maxWidth: "$15" }}
              $md={{ maxWidth: "$20" }}
            >
              {/* {title} */}
            </H6>
          </Flex>
          <Flex row alignItems="center" gap={16}>
            <TouchableArea
              hapticFeedback
              onPress={() => setEpubReaderOverviewModal(true)}
            >
              <List />
            </TouchableArea>
            <TouchableArea
              hapticFeedback
              onPress={() => setOpenSettings((p) => !p)}
            >
              <Settings2 />
            </TouchableArea>
          </Flex>
        </Flex>
        <EbookSettingsMenu
          openSettings={openSettings}
          hide={show}
          setOpenSettings={setOpenSettings}
        />
      </AnimatedFlex>

      <AnimatedFlex
        w={width}
        height={104}
        bg={"$background"}
        pos={"absolute"}
        bottom={0}
        left={0}
        right={0}
        entering={FadeInDown}
        exiting={FadeOutDown}
        paddingHorizontal="$4"
      ></AnimatedFlex>
    </>
  );
};

const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

const SCROLL_ENABLED = false;

export const epubReaderMenuThemeAtom = focusAtom(ebookSettignsAtom, (optic) =>
  optic.prop("theme")
);

export const epubReaderMenuScrolledAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("scrolled")
);

export const epubReaderMenuFontSizeAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("fontSize")
);

export const epubReaderMenuGapAtom = focusAtom(ebookSettignsAtom, (optic) =>
  optic.prop("gap")
);

export const epubReaderMenuLineHeightAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("lineHeight")
);

export const epubReaderMenuBlockSizeAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("maxBlockSize")
);

export const epubReaderMenuInlineSizeAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("maxInlineSize")
);

const Updater = () => {
  const settings = useAtomValue(ebookSettignsAtom);
  const { changeTheme } = useReader();

  useEffect(() => {
    changeTheme(settings);
  }, [settings]);
  return <></>;
};

const EbookSettingsMenu = ({
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

  const setReaderSettigns = useSetAtom(ebookSettignsAtom);

  // const [voicesModalOpen, setVoicesModalOpen] = useState(false);

  const onScrollViewChange = (checked: boolean) => {
    // if (checked === readerSettings.scrolled) return;

    setReaderSettigns((readerSettings) => ({
      ...readerSettings,
      scrolled: checked,
    }));
  };

  useEffect(() => {
    setReaderSettigns((prev: Theme) => ({ ...prev, maxInlineSize: width }));
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
      <Updater />
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
    // setReaderSettigns((readerSettings) => ({
    //   ...readerSettings,
    //   lineHeight: Math.max(0, readerSettings.lineHeight + step),
    // }));

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
    // setReaderSettigns((readerSettings) => {
    //   if (readerSettings.maxBlockSize === size) {
    //     setAudioplayerMode(false);
    //     return {
    //       ...readerSettings,
    //       maxBlockSize: height,
    //     };
    //   } else {
    //     setAudioplayerMode(true);
    //     return {
    //       ...readerSettings,
    //       maxBlockSize: size,
    //     };
    //   }
    // });

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
    // setReaderSettigns((readerSettings) => ({
    //   ...readerSettings,
    //   gap: Math.max(0, readerSettings.gap + step),
    // }));

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

  const onThemeChange = (theme: { name: string; bg: string; fg: string }) => {
    // if (theme.name === readerSettings.theme) return;
    // @ts-ignore
    // setReaderSettigns((readerSettings) => {
    //   return {
    //     ...readerSettings,
    //     theme: theme.name,
    //   };
    // });

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
    // setReaderSettigns((readerSettings) => ({
    //   ...readerSettings,
    //   fontSize: Math.max(20, readerSettings.fontSize + step),
    // }));

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

export default layout;