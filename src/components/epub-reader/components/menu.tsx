import { memo, useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
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

import {
  HEADER_HEIGHT,
  useAppSafeAreas,
} from "../../../hooks/use-app-safe-areas";
import { ebookSettignsAtom } from "../../../state/local-state";
import { HeaderFrame, HeaderLeft, HeaderRight } from "../../header/header";
import { LogoContainer } from "../../header/logo";
import { BackButton } from "../../layout/back-header";
import { Flex } from "../../layout/flex";
import { TouchableArea } from "../../touchable/touchable-area";
import { Theme, useReader } from "../rn-epub-reader";

import { Footer, Header } from "./header-footer";
import { MenuContainer } from "./menu-items";
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
  // const {
  //   pause,
  //   resume,
  //   inProgress,
  //   paused,
  //   stop,
  //   voiceList,
  //   voice,
  //   setVoice,
  // } = useTTS();

  const { top } = useAppSafeAreas();

  const [openSettings, setOpenSettings] = useState(false);
  // const [generalEpubReaderSettings, setGeneralEpubReaderSettings] = useAtom(
  //   generalEpubReaderSettingsAtom
  // );

  // useEffect(() => {
  //   changeTheme(readerSettings);
  // }, [readerSettings]);

  // useEffect(() => {
  //   if (!generalEpubReaderSettings.tts && inProgress) {
  //     console.log("STOPPPED IN THING");
  //     stop();
  //   }
  // }, [generalEpubReaderSettings.tts]);

  // useEffect(() => {
  //   if (inProgress) {
  //     setGeneralEpubReaderSettings((prev) => ({ ...prev, tts: true }));
  //   }
  // }, [inProgress]);

  return (
    <>
      {hide && (
        <Header>
          <HeaderFrame pt={top}>
            <HeaderLeft ai="center">
              <LogoContainer>
                <BackButton />
              </LogoContainer>
              <H6
                numberOfLines={1}
                $sm={{ maxWidth: "$15" }}
                $md={{ maxWidth: "$20" }}
              >
                {title}
              </H6>
            </HeaderLeft>
            <HeaderRight>
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
            </HeaderRight>
          </HeaderFrame>
          <EbookSettingsMenu
            openSettings={openSettings}
            hide={hide}
            setOpenSettings={setOpenSettings}
          />
        </Header>
      )}

      {hide && (
        <Footer paddingHorizontal="$4" paddingBottom="$4">
          {/* <Flex row ai="center" fill>
            {Platform.OS === "ios" && generalEpubReaderSettings.tts ? (
              !paused ? (
                <Button
                  circular
                  onPress={async () => await pause()}
                  icon={() => <Pause size="$1" fill={color} />}
                  size="$4"
                  ai="center"
                  jc="center"
                />
              ) : (
                <Button
                  ai="center"
                  jc="center"
                  size="$4"
                  circular
                  onPress={async () => await resume()}
                  icon={() => <Play fill={color} size="$1" />}
                />
              )
            ) : null}
          </Flex> */}
        </Footer>
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
    <MenuContainer t={HEADER_HEIGHT}>
      {/* theme & font size */}
      <Flex row justifyContent="space-between">
        <Flex row gap="$4">
          {themes.map((theme) => (
            <Flex
              onPress={() => onThemeChange(theme)}
              key={theme.name}
              bg={theme.bg}
              borderColor={
                readerSettings.theme === theme.name ? "$blue10" : undefined
              }
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

      <Flex space>
        {/* <Flex row ai="center" space="$4">
          {!isPdf ? (
            <>
              <Text pr="$7">Text to Speech</Text>
              <Switch
                size={"$4"}
                defaultChecked={generalEpubReaderSettings.tts}
                checked={generalEpubReaderSettings.tts}
                onCheckedChange={(checked) =>
                  setGeneralEpubReaderSettings({
                    ...generalEpubReaderSettings,
                    tts: checked,
                  })
                }
              >
                <Switch.Thumb animation="quick" />
              </Switch>
            </>
          ) : null}
        </Flex>
        {!isPdf && Platform.OS === "ios" && generalEpubReaderSettings.tts ? (
          <TTSVoiceModal
            setVoicesModalOpen={setVoicesModalOpen}
            voice={voice}
            voiceList={voiceList}
            voicesModalOpen={voicesModalOpen}
            setVoice={setVoice}
          />
        ) : null} */}
      </Flex>
    </MenuContainer>
  );
};

export default memo(Menu);
