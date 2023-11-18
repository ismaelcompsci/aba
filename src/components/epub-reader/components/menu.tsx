import { useEffect, useRef, useState } from "react";
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
import { Theme, useReader } from "../rn-epub-reader";

import { Footer, Header } from "./header-footer";
import { MenuContainer, ThemeButton, XGroupButton } from "./menu-items";
import { themes } from "./themes";

const FONT_STEP = 5;
const GAPSTEP = 0.01;
const LINESTEP = 0.1;

const SCROLL_ENABLED = false;

type TTSState = {
  inProgress: boolean;
  paused: boolean;
  pitch: number;
  rate: number;
  voiceList: null | Speech.Voice[];
  voice: undefined | string;
  language: string;
  text: string | undefined;
  action: string | undefined;
};

const useTTS = () => {
  const state = useRef<TTSState>({
    inProgress: false,
    paused: true,
    pitch: 1,
    rate: 0.75,
    voiceList: null,
    voice: undefined,
    language: "en",
    text: undefined,
    action: undefined,
  });

  const skip = useRef(false);

  const [inProgress, setInProgress] = useState(false);
  const [paused, setPaused] = useState(true);

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

  const _loadAllVoices = async () => {
    const availableVoices = await Speech.getAvailableVoicesAsync();
    state.current = {
      ...state.current,
      voiceList: availableVoices,
      voice: undefined,
    };
  };

  const forward = () => {
    initTTS();
    nextTTS(false);
  };

  const speak = async () => {
    if (!state.current.text) {
      goNext();
      await awaitTimeout(100);
      return forward();
    }

    let mark = 0;
    const text = state.current.text?.replace("\r\n.", "\r\n..") + "\r\n.";
    const regex = /<mark\sname="(\d+)"/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    const isPlaying = await Speech.isSpeakingAsync();
    if (isPlaying) {
      /**
       * clearing the queue
       * using the skip because stop() fires the onDone event
       */
      skip.current = true;
      await Speech.stop();
      await Speech.pause();
    }

    if (text) {
      Speech.speak(text, {
        voice: state.current.voice,
        language: state.current.language,
        pitch: state.current.pitch,
        rate: state.current.rate,
        onStart: () => {
          setPaused(false);
        },
        onDone: () => {
          if (skip.current) return;
          if (!skip.current) {
            nextTTS(false);
            skip.current = false;
          }
        },
        /**
         * onMark is only availible on web
         * so we use onBoundry ``
         */
        onBoundary: () => {
          setMarkTTS(`${matches[mark]}`);
          mark++;
          skip.current = false;
        },
      });
    }
  };

  const start = () => {
    initTTS();
    startTTS();
    state.current = { ...state.current, inProgress: true };
    setInProgress(true);
    setPaused(false);
  };

  const stop = () => {
    state.current = {
      ...state.current,
      inProgress: false,
      paused: false,
      text: undefined,
    };
    pauseTTSMark(true);
    setInProgress(false);
    setPaused(true);
    Speech.pause();
  };

  const pause = async () => {
    await Speech.pause();
    state.current = { ...state.current, paused: true };
    pauseTTSMark(false);
    setPaused(true);
  };

  const resume = () => {
    if (!state.current.inProgress) {
      start();
      return Speech.resume();
    }
    resumeTTS();
    Speech.resume();
    state.current = { ...state.current, paused: false };
    setPaused(false);
  };

  const pitch = (pitch: number) => {
    state.current = {
      ...state.current,
      pitch: pitch,
    };
  };

  const rate = (rate: number) => {
    state.current = { ...state.current, rate: rate };
  };

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    DeviceEventEmitter.addListener("TTS.ssml", async (event) => {
      const { ssml, action } = event;
      state.current = { ...state.current, text: ssml, action: action };
      speak();
    });

    return () => {
      stop();
      state.current = {
        ...state.current,
        inProgress: false,
        paused: false,
        text: undefined,
      };
      DeviceEventEmitter.removeAllListeners("TTS.ssml");
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "ios") {
        await _loadAllVoices();
      }
    })();
  }, []);

  return { state, pause, resume, inProgress, paused, stop };
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
  const { pause, resume, inProgress, paused, stop } = useTTS();
  const { height, width } = useWindowDimensions();
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

  useEffect(() => {
    setReaderSettigns((prev: Theme) => ({ ...prev, maxInlineSize: width }));
  }, [width]);

  useEffect(() => {
    if (!generalEpubReaderSettings.tts && inProgress) {
      console.log("STOPPPED IN THING");
      stop();
    }
  }, [generalEpubReaderSettings.tts]);

  useEffect(() => {
    if (inProgress) {
      setGeneralEpubReaderSettings((prev) => ({ ...prev, tts: true }));
    }
  }, [inProgress]);

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
                  {!isPdf ? (
                    <>
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
                    </>
                  ) : null}
                </XStack>
              </YStack>
            </MenuContainer>
          ) : null}
        </Header>
      )}

      {hide && (
        <Footer paddingHorizontal="$4" paddingBottom="$4">
          <XStack ai="center" flex={1}>
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
          </XStack>
        </Footer>
      )}
    </>
  );
};

export default Menu;
