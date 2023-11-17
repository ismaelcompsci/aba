import { useEffect, useState } from "react";
import {
  DeviceEventEmitter,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  ChevronLeft,
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUpDown,
  Fullscreen,
  List,
  Pause,
  Play,
  Settings2,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { atom, useAtom } from "jotai";
import {
  Button,
  H6,
  Label,
  Separator,
  Switch,
  Text,
  XGroup,
  XStack,
  YStack,
} from "tamagui";

import {
  HEADER_HEIGHT,
  useHeaderHeight,
} from "../../../hooks/use-header-height";
import useIconTheme from "../../../hooks/use-icon-theme";
import { ebookSettignsAtom } from "../../../state/local-state";
import { awaitTimeout } from "../../../utils/utils";
import { ClearIconButton } from "../../buttons/button";
import { HeaderFrame, HeaderLeft, HeaderRight } from "../../header/header";
import { LogoContainer } from "../../header/logo";
import { useReader } from "../rn-epub-reader";

import { Footer, Header } from "./header-footer";
import { MenuContainer, ThemeButton, XGroupButton } from "./menu-items";
import { themes } from "./themes";

const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

const SCROLL_ENABLED = false;

const useTTS = () => {
  const [playing, setPlaying] = useState("stopped");

  const {
    setMarkTTS,
    nextTTS,
    prevTTS,
    initTTS,
    resumeTTS,
    startTTS,
    pauseTTSMark,
    goNext,
  } = useReader();

  const pause = async () => {
    if (playing === "stopped") return;
    pauseTTSMark(false);
    setPlaying("paused");
    await Speech.pause();
  };

  const play = async () => {
    if (playing === "stopped") return start();

    setPlaying("playing");
    resumeTTS();
    await Speech.resume();
  };

  const start = () => {
    if (playing === "stopped") {
      initTTS();
    }
    startTTS();
  };

  const forward = () => {
    initTTS();
    nextTTS(false);
  };

  const stop = () => {
    Speech.stop();
    pauseTTSMark(true);
  };

  useEffect(() => {
    DeviceEventEmitter.addListener("TTS.ssml", async (event) => {
      const { ssml, action } = event;
      if (!ssml) {
        goNext();
        await awaitTimeout(100);
        return forward();
      }

      let mark = 0;
      const text = ssml?.replace("\r\n.", "\r\n..") + "\r\n.";
      const regex = /<mark\sname="(\d+)"/g;
      const matches: string[] = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
      }

      Speech.stop();
      Speech.speak(text, {
        language: "en",
        onError(error) {
          console.log("[TTS] onerror", error);
        },
        onStart: () => {
          setPlaying("playing");
        },
        onDone: () => {
          if (action !== "resume" || action !== "next") {
            nextTTS(true);
          }
        },
        onBoundary: () => {
          setMarkTTS(`${matches[mark]}`);
          mark++;
        },
      });
    });

    return () => {
      DeviceEventEmitter.removeAllListeners("TTS.ssml");
      stop();
    };
  }, []);

  return { pause, play, playing, start };
};

const def = {
  tts: false,
  voice: "",
};
type GeneralEpubReaderSettings = {
  tts: boolean;
  voice: string;
};
const generalEpubReaderSettingsAtom = atom<GeneralEpubReaderSettings>(def);

const Menu = ({
  hide,
  title,
  setEpubReaderOverviewModal,
}: {
  hide: boolean;
  title: string;
  setEpubReaderOverviewModal: (open: boolean) => void;
}) => {
  const { pause, play, playing } = useTTS();
  const { height } = useWindowDimensions();
  const { changeTheme, isPdf } = useReader();
  const { color } = useIconTheme();

  const { top } = useHeaderHeight();

  const [openSettings, setOpenSettings] = useState(false);
  const [readerSettings, setReaderSettigns] = useAtom(ebookSettignsAtom);
  const [generalEpubReaderSettings, setGeneralEpubReaderSettings] = useAtom(
    generalEpubReaderSettingsAtom
  );

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

  useEffect(() => {
    changeTheme(readerSettings);
  }, [readerSettings]);

  useEffect(() => {
    if (!hide) {
      setOpenSettings(false);
    }
  }, [hide]);

  return (
    <>
      {hide && (
        <Header>
          <HeaderFrame pt={top}>
            <HeaderLeft ai="center">
              <LogoContainer>
                <ClearIconButton onPress={() => router.back()}>
                  <ChevronLeft />
                </ClearIconButton>
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
              <ClearIconButton onPress={() => setEpubReaderOverviewModal(true)}>
                <List />
              </ClearIconButton>
              <ClearIconButton onPress={() => setOpenSettings((p) => !p)}>
                <Settings2 />
              </ClearIconButton>
            </HeaderRight>
          </HeaderFrame>
          {openSettings ? (
            <MenuContainer t={HEADER_HEIGHT}>
              {/* theme & font size */}
              <XStack justifyContent="space-between">
                <XStack gap="$4">
                  {themes.map((theme) => (
                    <ThemeButton
                      onPress={() => onThemeChange(theme)}
                      key={theme.name}
                      bg={theme.bg}
                      color={theme.fg}
                      borderColor={
                        readerSettings.theme === theme.name
                          ? "$blue10"
                          : undefined
                      }
                    >
                      Aa
                    </ThemeButton>
                  ))}
                </XStack>
                {!isPdf ? (
                  <XGroup>
                    <XGroupButton
                      onPress={() => onFontSizeChange(-FONT_STEP)}
                      fontSize={"$1"}
                    >
                      A
                    </XGroupButton>
                    <XGroupButton
                      onPress={() => onFontSizeChange(FONT_STEP)}
                      fontSize={"$7"}
                    >
                      A
                    </XGroupButton>
                  </XGroup>
                ) : null}
              </XStack>
              {/* Scroll & gap  */}
              <XStack justifyContent="space-between">
                <XStack alignItems="center" space="$2">
                  {Platform.OS === "ios" && SCROLL_ENABLED ? (
                    <>
                      <Label
                        paddingRight="$0"
                        minWidth={90}
                        justifyContent="flex-end"
                      >
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
                </XStack>
                {!isPdf ? (
                  <XGroup>
                    <XGroupButton
                      onPress={() => onGapChange(GAPSTEP)}
                      icon={ChevronsRightLeft}
                      px={16.5}
                    />
                    <XGroupButton
                      onPress={() => onGapChange(-GAPSTEP)}
                      icon={ChevronsLeftRight}
                      px={16.5}
                    />
                  </XGroup>
                ) : null}
              </XStack>
              {/* line space */}
              {!isPdf ? (
                <XStack justifyContent="space-between">
                  <XStack ai="center" space="$4">
                    <Text>AudioPlayer mode</Text>
                    <Button
                      onPress={onBlockSizeChange}
                      borderColor={audioplayerMode ? "$blue10" : undefined}
                    >
                      <Fullscreen />
                    </Button>
                  </XStack>
                  <XGroup>
                    <XGroupButton
                      onPress={() => onLineSpaceChange(-LINESTEP)}
                      icon={ChevronsDownUp}
                      px={16.5}
                    />
                    <XGroupButton
                      onPress={() => onLineSpaceChange(LINESTEP)}
                      icon={ChevronsUpDown}
                      px={16.5}
                    />
                  </XGroup>
                </XStack>
              ) : null}

              <YStack>
                <XStack ai="center" space="$4">
                  <Text pr="$4.5">Text to Speech</Text>
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
                </XStack>
              </YStack>
            </MenuContainer>
          ) : null}
        </Header>
      )}

      {hide && (
        <Footer paddingHorizontal="$4" paddingBottom="$4">
          <XStack ai="center" flex={1}>
            {generalEpubReaderSettings.tts ? (
              playing === "playing" ? (
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
                  onPress={async () => await play()}
                  icon={() => <Play fill={color} size="$1" />}
                />
              )
            ) : null}
          </XStack>
        </Footer>
      )}
    </>
  );
};

export default Menu;
