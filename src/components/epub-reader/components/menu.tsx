import { memo, useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
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
import { useAtom } from "jotai";
import { Button, H6, Label, Separator, Switch, Text } from "tamagui";

import { useAppSafeAreas } from "../../../hooks/use-app-safe-areas";
import { ebookSettignsAtom } from "../../../state/local-state";
import { BackButton } from "../../layout/back-header";
import { AnimatedFlex, Flex } from "../../layout/flex";
import { TouchableArea } from "../../touchable/touchable-area";
import { Theme, useReader } from "../rn-epub-reader";

import { themes } from "./themes";

const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

const SCROLL_ENABLED = false;

// const def = {
//   tts: false,
//   voice: "",
// };
// type GeneralEpubReaderSettings = {
//   tts: boolean;
//   voice: string;
// };
// const generalEpubReaderSettingsAtom = atom<GeneralEpubReaderSettings>(def);

const Menu = ({
  hide,
  title,
  setEpubReaderOverviewModal,
}: {
  hide: boolean;
  title: string;
  setEpubReaderOverviewModal: (open: boolean) => void;
}) => {
  const { width } = useWindowDimensions();
  const { top, bottom, left, right } = useAppSafeAreas();

  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      {hide && (
        <AnimatedFlex
          w={width}
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
                {title}
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
            hide={hide}
            setOpenSettings={setOpenSettings}
          />
        </AnimatedFlex>
      )}

      {hide && (
        <AnimatedFlex
          w={width}
          bg={"$background"}
          pos={"absolute"}
          bottom={0}
          left={0}
          right={0}
          entering={FadeInDown}
          exiting={FadeOutDown}
          paddingHorizontal="$4"
          paddingBottom={bottom}
        ></AnimatedFlex>
      )}
    </>
  );
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
  const { height, width } = useWindowDimensions();
  const { changeTheme, isPdf } = useReader();

  const [readerSettings, setReaderSettigns] = useAtom(ebookSettignsAtom);

  // const [voicesModalOpen, setVoicesModalOpen] = useState(false);
  const [audioplayerMode, setAudioplayerMode] = useState(
    readerSettings.maxBlockSize !== height
  );

  const onThemeChange = (theme: { name: string; bg: string; fg: string }) => {
    if (theme.name === readerSettings.theme) return;
    setReaderSettigns({ ...readerSettings, theme: theme.name });
  };

  const onScrollViewChange = (checked: boolean) => {
    if (checked === readerSettings.scrolled) return;

    setReaderSettigns({ ...readerSettings, scrolled: checked });
  };

  const onFontSizeChange = (step: number) => {
    setReaderSettigns({
      ...readerSettings,
      fontSize: Math.max(20, readerSettings.fontSize + step),
    });
  };

  const onGapChange = (step: number) => {
    setReaderSettigns({
      ...readerSettings,
      gap: Math.max(0, readerSettings.gap + step),
    });
  };

  const onLineSpaceChange = (step: number) => {
    setReaderSettigns({
      ...readerSettings,
      lineHeight: Math.max(0, readerSettings.lineHeight + step),
    });
  };

  const onBlockSizeChange = () => {
    const size = height - 120 * 2 - 30;
    if (readerSettings.maxBlockSize === size) {
      setReaderSettigns({
        ...readerSettings,
        maxBlockSize: height,
      });
      setAudioplayerMode(false);
    } else {
      setReaderSettigns({
        ...readerSettings,
        maxBlockSize: size,
      });
      setAudioplayerMode(true);
    }
  };

  const updateTheme = () => {
    changeTheme(readerSettings);
  };

  useEffect(() => {
    updateTheme();
  }, [readerSettings]);

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
      zIndex={99999}
      h={300}
      w={width}
      px={"$5"}
      py={"$4"}
      bg={"$background"}
      space={"$2"}
      entering={FadeInUp}
      exiting={FadeOutUp}
    >
      {/* theme & font size */}
      <Flex row justifyContent="space-between">
        <Flex row gap="$4">
          {themes.map((theme) => (
            <Flex
              onPress={() => onThemeChange(theme)}
              key={theme.name}
              bg={theme.bg}
              borderColor={
                readerSettings.theme === theme.name ? "$blue10" : "$gray11"
              }
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
        {!isPdf ? (
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
        ) : null}
      </Flex>
      {/* Scroll & gap  */}
      <Flex row justifyContent="space-between">
        <Flex row alignItems="center" space="$2">
          {Platform.OS === "ios" && SCROLL_ENABLED ? (
            <>
              <Label paddingRight="$0" minWidth={90} justifyContent="flex-end">
                Scrolling View
              </Label>
              <Text fontSize={8}>(beta)</Text>
              <Separator minHeight={20} vertical pl={"$4"} />
              <Switch
                defaultChecked={readerSettings.scrolled}
                onCheckedChange={onScrollViewChange}
              >
                <Switch.Thumb animation="quick" />
              </Switch>
            </>
          ) : null}
        </Flex>
        {!isPdf ? (
          <Flex row centered space={"$6"}>
            <TouchableArea hapticFeedback onPress={() => onGapChange(GAPSTEP)}>
              <ChevronsRightLeft size={"$1"} />
            </TouchableArea>
            <TouchableArea hapticFeedback onPress={() => onGapChange(-GAPSTEP)}>
              <ChevronsLeftRight size={"$1"} />
            </TouchableArea>
          </Flex>
        ) : null}
      </Flex>
      {/* line space */}
      {!isPdf ? (
        <Flex row justifyContent="space-between">
          <Flex row ai="center" space="$4">
            <Text>AudioPlayer mode</Text>
            <Button
              onPress={onBlockSizeChange}
              borderColor={audioplayerMode ? "$blue10" : undefined}
            >
              <Fullscreen />
            </Button>
          </Flex>
          <Flex row centered space={"$6"}>
            <TouchableArea
              hapticFeedback
              onPress={() => onLineSpaceChange(-LINESTEP)}
            >
              <ChevronsDownUp size={"$1"} />
            </TouchableArea>
            <TouchableArea
              hapticFeedback
              onPress={() => onLineSpaceChange(LINESTEP)}
            >
              <ChevronsUpDown size={"$1"} />
            </TouchableArea>
          </Flex>
        </Flex>
      ) : null}

      <Flex space></Flex>
    </AnimatedFlex>
  );
};

export default memo(Menu);
